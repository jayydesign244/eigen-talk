import { useState } from 'react'
import { motion } from 'motion/react'
import { FileAudioIcon, ImageIcon, SendIcon, SparklesIcon, XIcon } from 'lucide-react'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from '@/components/ui/message'
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@/components/ui/bubble'
import {
  Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup,
  AttachmentMedia, AttachmentTitle,
} from '@/components/ui/attachment'
import {
  MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader, Preview, Section } from './kit'

function AiAvatar() {
  return (
    <MessageAvatar className="size-7 bg-brand text-brand-foreground">
      <SparklesIcon className="size-3.5" />
    </MessageAvatar>
  )
}

function MessagePage() {
  return (
    <>
      <PageHeader eyebrow="Chat" title="Message" description="A row in a conversation: avatar, header, bubbles and footer. The AI's avatar is the one place the brand colour fills a circle." />
      <Section title="Conversation">
        <Preview center={false}>
          <MessageGroup className="w-full max-w-lg gap-5">
            <Message align="end">
              <MessageContent>
                <Bubble><BubbleContent>Remove the ums and make my voice a bit warmer.</BubbleContent></Bubble>
                <MessageFooter>Sent · 12:04</MessageFooter>
              </MessageContent>
            </Message>
            <Message>
              <AiAvatar />
              <MessageContent>
                <MessageHeader>Sonicly</MessageHeader>
                <Bubble variant="secondary"><BubbleContent>Done — I removed 34 filler words and added a gentle low-mid boost. Want me to compare before and after?</BubbleContent></Bubble>
                <MessageFooter>2 edits · v4</MessageFooter>
              </MessageContent>
            </Message>
          </MessageGroup>
        </Preview>
      </Section>
    </>
  )
}

function BubblePage() {
  return (
    <>
      <PageHeader eyebrow="Chat" title="Bubble" description="Rounded speech bubbles (16px) with one tighter corner on the speaker's side. The user's bubble is solid ink; the assistant's sits on the card surface." />
      <Section title="Variants">
        <Preview center={false} contentClassName="grid max-w-xl gap-3">
          {['default', 'secondary', 'muted', 'tinted', 'outline', 'destructive', 'ghost'].map((v, i) => (
            <Bubble key={v} variant={v} align={i % 2 ? 'start' : 'end'}><BubbleContent>{v} — Make the intro 10 seconds shorter.</BubbleContent></Bubble>
          ))}
        </Preview>
      </Section>
      <Section title="Group, reactions & actions">
        <Preview center={false}>
          <BubbleGroup className="w-full max-w-md">
            <Bubble variant="secondary"><BubbleContent>Here are three ways to tighten the intro:</BubbleContent></Bubble>
            <Bubble variant="outline"><BubbleContent asChild><button>1. Cut the cold open</button></BubbleContent></Bubble>
            <Bubble variant="outline"><BubbleContent asChild><button>2. Trim the music bed to 4s</button></BubbleContent></Bubble>
            <Bubble variant="secondary" className="mb-4">
              <BubbleContent>3. Both — saves 18 seconds.</BubbleContent>
              <BubbleReactions>👍 2</BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </Preview>
      </Section>
    </>
  )
}

function AttachmentPage() {
  return (
    <>
      <PageHeader eyebrow="Chat" title="Attachment" description="Files in the composer and in messages. Uploading and processing titles shimmer; errors go red with a reason." />
      <Section title="States">
        <Preview center={false}>
          <AttachmentGroup className="w-full">
            {[
              ['done', 'interview_raw.wav', '52.1 MB · 58:02'],
              ['uploading', 'b-roll_ambience.mp3', 'Uploading 64%'],
              ['processing', 'ep42_take2.m4a', 'Transcribing…'],
              ['error', 'session_full.aif', 'Over 2 GB limit'],
              ['idle', 'Drop a file', 'MP3, WAV, M4A, FLAC'],
            ].map(([state, title, desc]) => (
              <Attachment key={state} state={state}>
                <AttachmentMedia>{state === 'uploading' || state === 'processing' ? <Spinner /> : <FileAudioIcon />}</AttachmentMedia>
                <AttachmentContent><AttachmentTitle>{title}</AttachmentTitle><AttachmentDescription>{desc}</AttachmentDescription></AttachmentContent>
                {state !== 'idle' && <AttachmentActions><AttachmentAction aria-label="Remove"><XIcon /></AttachmentAction></AttachmentActions>}
              </Attachment>
            ))}
          </AttachmentGroup>
        </Preview>
      </Section>
      <Section title="Vertical & sizes">
        <Preview>
          <Attachment orientation="vertical"><AttachmentMedia><ImageIcon /></AttachmentMedia><AttachmentContent><AttachmentTitle>cover.png</AttachmentTitle><AttachmentDescription>1.2 MB</AttachmentDescription></AttachmentContent></Attachment>
          <Attachment size="sm"><AttachmentMedia><FileAudioIcon /></AttachmentMedia><AttachmentContent><AttachmentTitle>clip.mp3</AttachmentTitle></AttachmentContent></Attachment>
          <Attachment size="xs"><AttachmentMedia><FileAudioIcon /></AttachmentMedia><AttachmentContent><AttachmentTitle>xs.wav</AttachmentTitle></AttachmentContent></Attachment>
        </Preview>
      </Section>
    </>
  )
}

const SEED = [
  { role: 'user', text: 'Clean up the background hum.' },
  { role: 'ai', text: 'Removed a 60 Hz hum and its harmonics. Noise floor is now −62 dB.' },
  { role: 'user', text: 'Nice. Now cut the long pauses.' },
  { role: 'ai', text: 'Shortened 18 pauses longer than 1.2 s — the episode is 1 m 40 s shorter.' },
]

function MessageScrollerPage() {
  const [messages, setMessages] = useState(SEED)
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const send = () => {
    const t = text.trim()
    if (!t) return
    setText('')
    setMessages((m) => [...m, { role: 'user', text: t }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      setMessages((m) => [...m, { role: 'ai', text: `On it — “${t}” applied as a new version.` }])
    }, 900)
  }
  return (
    <>
      <PageHeader eyebrow="Chat" title="Message scroller" description="A chat viewport that sticks to the live edge, fades at the bottom and offers a jump-to-latest button when you scroll up." />
      <Section title="Live chat">
        <Preview single padded={false}>
          <div className="flex h-[440px] w-full max-w-lg flex-col border-x border-border">
            <MessageScrollerProvider>
              <MessageScroller className="flex-1">
                <MessageScrollerViewport className="px-4 pt-4">
                  <MessageScrollerContent className="gap-4 pb-6">
                    <Marker variant="separator"><MarkerContent>Today</MarkerContent></Marker>
                    {messages.map((m, i) => (
                      <MessageScrollerItem key={i}>
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                          <Message align={m.role === 'user' ? 'end' : 'start'}>
                            {m.role === 'ai' && <AiAvatar />}
                            <MessageContent>
                              <Bubble variant={m.role === 'user' ? 'default' : 'secondary'}><BubbleContent>{m.text}</BubbleContent></Bubble>
                            </MessageContent>
                          </Message>
                        </motion.div>
                      </MessageScrollerItem>
                    ))}
                    {thinking && (
                      <MessageScrollerItem>
                        <Marker><MarkerIcon><Spinner /></MarkerIcon><MarkerContent>Sonicly is working…</MarkerContent></Marker>
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
            <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); send() }}>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe a change…" />
              <Button type="submit" size="icon" aria-label="Send" disabled={!text.trim()}><SendIcon /></Button>
            </form>
          </div>
        </Preview>
      </Section>
    </>
  )
}

export const CHAT_DEMOS = [
  { slug: 'message', title: 'Message', Page: MessagePage },
  { slug: 'bubble', title: 'Bubble', Page: BubblePage },
  { slug: 'attachment', title: 'Attachment', Page: AttachmentPage },
  { slug: 'message-scroller', title: 'Message Scroller', Page: MessageScrollerPage },
]
