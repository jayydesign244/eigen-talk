# Android emulator setup → pull the official CRED APK

**For Claude Code (or a person) on a fresh computer that already has Android Studio downloaded/installed.**
Goal: run a virtual Android phone with the Play Store, let the user install **CRED** from Google Play, then copy CRED's genuine APK files to a folder so the design values (colors, spacing, radius, type, motion) can be extracted for Sonicly's design system.

> **Why this way:** CRED isn't on APKMirror, and "free APK" sites hand out fake/wrapped installers (we once got Aptoide instead of CRED). Installing from Google Play inside an emulator gives the genuine, Dreamplug-signed app.

---

## Rules for the assistant running this

1. **Ask before accepting licences.** Installing the Android SDK requires accepting Google's Android SDK License (https://developer.android.com/studio/terms). Show the link and get an explicit "yes, accept" from the user first.
2. **Never type the user's passwords.** The user signs in to Google Play and installs CRED themselves. You never open or log in to CRED. We only need it *installed*.
3. **Never bypass protections.** If CRED refuses to run on an emulator, that's fine — don't try to get around it. We only copy the installed files.
4. **Don't delete anything permanently.** Clean-up = move to Trash / Recycle Bin; the user empties it.
5. **Check disk space first** (step 1). Stop and tell the user if it's too low.
6. Report progress in plain language after each step.

---

## Step 0 — Detect the platform

```bash
uname -s          # Darwin = macOS, Linux = Linux (Windows: use PowerShell, see notes)
uname -m          # arm64 = Apple silicon / ARM, x86_64 = Intel/AMD
```

- **ABI to use:** `arm64-v8a` on Apple silicon/ARM, `x86_64` on Intel/AMD.
- **SDK location (default, same as Android Studio):**
  - macOS: `$HOME/Library/Android/sdk`
  - Linux: `$HOME/Android/Sdk`
  - Windows: `%LOCALAPPDATA%\Android\Sdk`

## Step 1 — Check disk space

Need **~15 GB free** (SDK ~6 GB, phone ~4–6 GB, CRED + headroom).

```bash
df -h "$HOME" | tail -1      # macOS/Linux
```
Windows (PowerShell): `Get-PSDrive C`

If under 15 GB → stop and tell the user.

## Step 2 — Find Java (needed by the SDK tools)

Android Studio ships its own Java runtime — use it:

```bash
# macOS
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
# Linux (adjust to the install path)
export JAVA_HOME="$HOME/android-studio/jbr"
"$JAVA_HOME/bin/java" -version
```
Windows: `$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"`

## Step 3 — Install the SDK command-line tools

**Option A (simplest, no terminal licence step):** ask the user to open Android Studio once and finish the **Standard** setup wizard (they click *Accept* on the licence screens). This installs the SDK + platform-tools + emulator into the default location. Then skip to Step 5.

**Option B (terminal):** download Google's command-line tools into the SDK folder.

```bash
SDK="$HOME/Library/Android/sdk"            # use the platform default from Step 0
mkdir -p "$SDK/cmdline-tools"
cd "$SDK/cmdline-tools"
# macOS:   commandlinetools-mac-*_latest.zip
# Linux:   commandlinetools-linux-*_latest.zip
# Windows: commandlinetools-win-*_latest.zip
# Get the current link from https://developer.android.com/studio#command-line-tools-only
curl -L -o tools.zip "<link from that page>"
unzip -q tools.zip && rm tools.zip
mv cmdline-tools latest
export ANDROID_HOME="$SDK"
export PATH="$SDK/cmdline-tools/latest/bin:$SDK/platform-tools:$SDK/emulator:$PATH"
sdkmanager --version
```

## Step 4 — Accept licences (**only after the user says yes**)

```bash
yes | sdkmanager --sdk_root="$ANDROID_HOME" --licenses
```

## Step 5 — Install emulator, adb, build-tools and a **Google Play** system image

Pick the newest *Google Play* image for this machine's ABI:

```bash
sdkmanager --sdk_root="$ANDROID_HOME" --list | grep "google_apis_playstore;$( [ "$(uname -m)" = arm64 ] && echo arm64-v8a || echo x86_64 )"
```

Then install (example uses Android 35; use the newest line you saw):

```bash
ABI=$( [ "$(uname -m)" = arm64 ] && echo arm64-v8a || echo x86_64 )
IMG="system-images;android-35;google_apis_playstore;$ABI"
sdkmanager --sdk_root="$ANDROID_HOME" "platform-tools" "emulator" "build-tools;35.0.0" "$IMG"
```

~2–3 GB download. It must be a **`google_apis_playstore`** image — plain `google_apis` has no Play Store.

## Step 6 — Create the virtual phone

```bash
avdmanager create avd -n CredPhone -k "$IMG" -d pixel_7 --force
# give it room for the app:
echo "disk.dataPartition.size=8G" >> "$HOME/.android/avd/CredPhone.avd/config.ini"
```

## Step 7 — Start it

```bash
emulator -avd CredPhone -no-snapshot-save &
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 3; done
echo "Booted"
```
A phone window opens. First boot takes 1–3 minutes.

## Step 8 — 👤 User action: install CRED from Google Play

Tell the user exactly this:

> In the virtual phone window: open **Play Store** → sign in with any Google account → search **"CRED"** → check the developer is **Dreamplug Technologies** → **Install**. You don't need to open or log in to CRED. Tell me when it says *Installed*.

Wait for the user.

## Step 9 — Pull the APK files (all splits)

```bash
PKG=com.dreamplug.androidapp
OUT="$HOME/cred-apk"
mkdir -p "$OUT"
adb shell pm path "$PKG"          # usually base.apk + several split_*.apk
for p in $(adb shell pm path "$PKG" | sed 's/^package://' | tr -d '\r'); do
  adb pull "$p" "$OUT/"
done
ls -la "$OUT"
adb shell dumpsys package "$PKG" | grep -E "versionName|versionCode" | head -2
```

## Step 10 — Verify it's genuine

```bash
"$ANDROID_HOME/build-tools/35.0.0/apksigner" verify --print-certs "$OUT/base.apk" | head -5
aapt2 dump badging "$OUT/base.apk" 2>/dev/null | head -1 \
  || "$ANDROID_HOME/build-tools/35.0.0/aapt" dump badging "$OUT/base.apk" | head -1
```
Expected: `package: name='com.dreamplug.androidapp'` and a certificate issued to **Dreamplug**. If not → stop and tell the user.

## Step 11 — Hand the files over

Zip them and give them to the user to bring back to the Sonicly machine:

```bash
cd "$HOME" && zip -r cred-apk.zip cred-apk && ls -lh cred-apk.zip
```

Tell the user: *"Copy `~/cred-apk.zip` to the Sonicly computer (e.g. into `Downloads`) and tell Claude there that the real CRED APK is ready."*

## Step 12 — Clean up (optional, ask first)

```bash
adb emu kill
```
Leave Android Studio/SDK installed unless the user asks to remove them. If they do, **move to Trash** (macOS: `~/Library/Android`, `~/.android`, `/Applications/Android Studio.app`) — never permanently delete.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Emulator won't start on Apple silicon | Make sure the image ABI is `arm64-v8a` |
| Emulator very slow on Intel/Windows | Enable virtualization (VT-x/AMD-V) in BIOS; on Windows install the *Android Emulator Hypervisor Driver* via `sdkmanager "extras;google;Android_Emulator_Hypervisor_Driver"` |
| Play Store says "device not compatible" for CRED | Try a newer Google Play image (Step 5) or the `pixel_7` profile; some apps also need ≥ 4 GB RAM: add `hw.ramSize=4096` to `config.ini` |
| `adb: no devices` | `adb kill-server && adb start-server`, then `adb devices` |
| Not enough disk | Free space or use an external drive: set `ANDROID_AVD_HOME` to a folder on it before Step 6 |

## What happens next (on the Sonicly computer)

Claude decodes the APKs with `apktool`/`jadx`, extracts **values only** (colors, spacing, corner radius, strokes, elevation/shadows, type scale, motion), compares them with NeoPOP (CRED's open-source design system: https://github.com/CRED-CLUB/neopop-web) and Sonicly's current tokens, and reports what's still missing so the user can send iPhone screenshots for those screens. **No CRED fonts, images, icons or code are copied into the repo** — only values, re-implemented as Sonicly's own components.
