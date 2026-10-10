# CRED screen checklist

Every screen and bottom sheet found in CRED 6.1.4.157's app files (Flutter screen/page/sheet files and Android activities). Names come from file names, so a few are internal or variants of one another. Many screens are filled in by CRED's server after login, so the file name is the best handle we have.

**How to use:** tick the ones you capture on your iPhone (screenshot, or a screen recording for flows and animations). Send them in batches and I'll add them to the reference.

Totals: **642 screens**, **400 bottom sheets**, **58 native Android screens**.

## Already captured (your 10 screenshots)

- [x] Autopay bottom sheet on Home
- [x] Cards tab: card overview (overdue, spends summary)
- [x] Cards tab: know your perks
- [x] Cards tab: milestones & offers
- [x] Home (For you, explore CRED, rewards card)
- [x] Home (offers carousel, quick access)
- [x] Home (top: Now live, money matters, upcoming bills)
- [x] More tab: bills & payments
- [x] More tab: explore, benefits, others
- [x] More tab: search + for you + money matters

## Core app (onboarding, home, bank, UPI, statements, investments…)
`cred_flutter` · 194 screens · 111 sheets

**Screens**

- *add_card_v2*: ☐ add card v2 background · ☐ add card v2 card · ☐ add card v2 card details · ☐ add card v2 home · ☐ add card v2 search
- *alfred_error_bottomsheet*: ☐ alfred error bottomsheet
- *bankcharges*: ☐ bank charges · ☐ bank charges error · ☐ bank statement processing
- *bankcharges/alltransactions*: ☐ bank statement all transactions
- *bankcharges/bankchargedetails*: ☐ bank charges detailed info
- *bbps*: ☐ blocker bbps
- *bbps_account_review*: ☐ bbps account review
- *bbps_mark_as_paid*: ☐ bbps final mark as paid · ☐ bbps march as paid success · ☐ bbps mark as paid
- *cash/add_bank_account_v2*: ☐ bank account bottom sheet · ☐ bank account v2
- *cash_consent/home*: ☐ cash consent
- *cbdc/home*: ☐ cbdc home
- *cbdc/onboarding*: ☐ cbdc consent · ☐ cbdc onboarding base · ☐ cbdc onboarding timeout · ☐ cbdc post kyc · ☐ cbdc preconsent · ☐ select kyc · ☐ verify details · ☐ wallet onboarding otp
- *cbdc/pps*: ☐ cbdc pps polling · ☐ cbdc pps status
- *cbdc/profile*: ☐ cbdc profile
- *cm/emi*: ☐ cm cc emi details
- *cm/emi_loan_details*: ☐ cm cc emi loan details
- *cm/previews*: ☐ cm dummy
- *cm/rewards*: ☐ cm cc reward details
- *cm/statements*: ☐ cm cp interstitial · ☐ cm transactions · ☐ cm unbilled statements · ☐ cms statement details · ☐ cms txns category edit · ☐ cms txns details
- *commons*: ☐ failure · ☐ timed loader
- *consumer_payments/campaign_details*: ☐ rupay campaign details
- *consumer_payments/rc_linking*: ☐ rc linking
- *cred_hybrid_nav_test*: ☐ flutter1
- *fx_retail/book_currency*: ☐ fx retail book currency
- *fx_retail/home*: ☐ fx home success · ☐ fx retail draggable amount · ☐ fx retail home
- *fx_retail/onboarding*: ☐ fx add bank · ☐ fx onboarding success · ☐ fx retail onboarding · ☐ onboarding bank · ☐ onboarding details · ☐ onboarding otp
- *fx_retail/pps*: ☐ fx pps
- *fx_retail/pre_pps*: ☐ pre pps
- *gift_vouchers/my_voucher_details*: ☐ my voucher details
- *gift_vouchers/voucher_buy_status*: ☐ voucher success lottie
- *gift_vouchers/voucher_details*: ☐ voucher details
- *gift_vouchers/voucher_pps*: ☐ voucher single
- *gift_vouchers/voucher_unlocking*: ☐ voucher unlocking
- *hooked/claw_machine*: ☐ hooked claw machine · ☐ hooked claw machine error
- *inapp_token*: ☐ inapp token onboard progress
- *inapp_token_v2/card_preparation_screen*: ☐ inapp token v2 card preparation
- *inapp_token_v2/concent_screen*: ☐ inapp token v2 consent
- *inapp_token_v2/manual_otp_screen*: ☐ inapp token v2 manual otp
- *inapp_token_v2/otp_auto_fetch_screen*: ☐ inapp token v2 otp auto fetch
- *inapp_token_v2/select_cards_screen*: ☐ inapp token v2 cards selection
- *inapp_token_v2/success_screen*: ☐ inapp token v2 success
- *inapp_token_v2/summary_screen*: ☐ inapp token v2 summary
- *inapp_token_v2/wrapper_screen*: ☐ inapp token v2 wrapper
- *max/add_bank*: ☐ max add bank · ☐ max add bank details · ☐ max add bank search
- *max/documents*: ☐ max documents
- *mint/home*: ☐ mint home
- *mint/interest_education*: ☐ mint interest education
- *mint/intro*: ☐ why mint
- *mint/investment*: ☐ mint investment amount selection · ☐ mint investment failure · ☐ mint investment scheme selection · ☐ mint scheme switch success · ☐ mint scheme switch summary
- *mint/invite*: ☐ invite
- *mint/misc*: ☐ error
- *mint/ntu_onboarding*: ☐ mint ntu intro · ☐ mint ntu reveal · ☐ mint ntu why mint
- *mint/passbook*: ☐ mint passbook
- *mint/status*: ☐ mint processing failure · ☐ mint success
- *mint/upgrade_account*: ☐ mint upgrade account failure
- *mint/withdraw*: ☐ mint withdraw · ☐ mint withdraw graph · ☐ mint withdraw reason · ☐ mint withdraw scheme selection
- *mint_waitlist_coin_burn*: ☐ mint waitlist coin burn
- *money/bank_details*: ☐ money bank details
- *money/bank_summary*: ☐ money bank summary · ☐ money bank summary success
- *money/common*: ☐ money error
- *money/in_and_out*: ☐ money in and out home
- *money/in_and_out_filters*: ☐ in out filters
- *money/key_updates*: ☐ money key updates
- *money/money_onboarding_intro*: ☐ onboarding carousel
- *money/recurring_detail*: ☐ money recurring detail
- *money/recurring_onboarding*: ☐ money rec ob ques · ☐ money rec ob txn · ☐ money rec ob txn detail
- *money/recurring_payments*: ☐ money rec payments initial
- *money/tagging*: ☐ tagging home
- *money/tagging_similar*: ☐ tag similar transaction
- *money/transaction_details*: ☐ money transaction details
- *money/transaction_filters*: ☐ money transaction filters
- *money/transactions*: ☐ money transactions
- *onboarding*: ☐ cards and bills · ☐ error
- *p2p/bank_transfer*: ☐ upi add beneficiary
- *p2p/pinning_search*: ☐ p2p pinning search
- *p2p/search*: ☐ search
- *p2p/transaction_history*: ☐ amount · ☐ error · ☐ no transaction · ☐ transaction history loading
- *p2p/transactions_history_v2*: ☐ p2p draggable amount
- *paytab/cashback_unlock_expiry*: ☐ cashback unlock expiry · ☐ cashback unlocked
- *ppi_wallet/add_bank*: ☐ ppi wallet add bank details · ☐ ppi wallet add bank error · ☐ ppi wallet add bank listing · ☐ ppi wallet add bank listing loaded · ☐ ppi wallet add bank search
- *ppi_wallet/close*: ☐ ppi wallet close
- *ppi_wallet/close_transfer*: ☐ ppi wallet close transfer · ☐ ppi wallet close transfer polling
- *ppi_wallet/faq_screen*: ☐ ppi wallet faq
- *ppi_wallet/home*: ☐ ppi wallet consent · ☐ ppi wallet home · ☐ ppi wallet home loaded · ☐ ppi wallet know more · ☐ ppi wallet preconsent
- *ppi_wallet/home_settings*: ☐ ppi wallet transaction limit bs · ☐ ppi wallet transaction limit otp
- *ppi_wallet/home_v2*: ☐ ppi wallet home v2 · ☐ ppi wallet settings
- *ppi_wallet/onboarding*: ☐ confirm address · ☐ error bs · ☐ ppi wallet ckyc otp · ☐ ppi wallet new pan flow · ☐ ppi wallet nominee details · ☐ ppi wallet nominee success · ☐ ppi wallet onboarding loader · ☐ ppi wallet onboarding timeout · ☐ ppi wallet pan confirmation · ☐ ppi wallet success · ☐ ppi wallet upi on ppi success · ☐ select kyc · ☐ user detail capture · ☐ verify details · ☐ wallet onboarding otp
- *ppi_wallet/rekyc*: ☐ ppi wallet rekyc loader · ☐ rekyc confirm details
- *ppi_wallet/send_money*: ☐ ppi wallet send money amount entry
- *ppi_wallet/status_polling*: ☐ ppi wallet status polling
- *ppi_wallet/streak*: ☐ ppi wallet streak
- *ppi_wallet/topup*: ☐ ppi wallet topup amount entry
- *ppi_wallet/transaction_status*: ☐ ppi wallet transaction status
- *ppi_wallet/transfers*: ☐ ppi wallet transfers home · ☐ ppi wallet transfers search · ☐ ppi wallet transfers search add beneficiary bs
- *promotion_nudge*: ☐ promotion nudge
- *receive_money_flow_reward*: ☐ receive money flow reward
- *referral/leaderboard*: ☐ referral leaderboard · ☐ referral leaderboard error
- *referral/splash*: ☐ splash
- *scan_and_pay/consumer_upi_interjection*: ☐ consumer upi interjection base
- *scan_and_pay/sap_post_payment*: ☐ sap post payment success
- *store/orders*: ☐ cancel return bs list · ☐ order details · ☐ orders listing · ☐ orders listing items
- *unbundling*: ☐ lib unbundling
- *upi_number_mapper*: ☐ link initial · ☐ linked other upiapp · ☐ upi number list
- *win/pop_game*: ☐ pop game enter challenge · ☐ pop game invite · ☐ pop pre game invite contact
- *win/pop_redemption*: ☐ pop redemption

**Bottom sheets**

- *alfred_error_bottomsheet*: ☐ alfred error · ☐ alfred error bottomsheet
- *bankcharges*: ☐ bank charges consent · ☐ bank charges menu
- *bankcharges/bankchargedetails*: ☐ bank statement detailed info more
- *bbps_account_review*: ☐ bbps account review
- *cash_consent/home*: ☐ cash consent
- *checkout/instrument_bs*: ☐ instrument error
- *cm/common*: ☐ cm generic
- *cm/statements*: ☐ add note · ☐ cm all merchants · ☐ cm single merchant · ☐ cm stmt hidden charges · ☐ cm transaction info
- *commons*: ☐ bottom · ☐ confirmation · ☐ cred material modal
- *commons/bottom_sheets*: ☐ info · ☐ information list · ☐ list · ☐ option · ☐ simple · ☐ stacked
- *commons/tenure_picker*: ☐ tenure picker
- *commons/widget_campaign*: ☐ ios widget instruction
- *consumer_payments/rc_linking*: ☐ rc
- *cred_form_ui/templates*: ☐ selection
- *credpaygateway*: ☐ credpaygateway error
- *fx_retail/home*: ☐ fx home interstitial · ☐ fx home settings
- *fx_retail/pps*: ☐ fx pps refund · ☐ fx pps view breakup
- *generic_navigator/generic_bottom_sheet_flows*: ☐ mint rfi coin burn pitch · ☐ open ask for invite · ☐ open cred protect · ☐ open datepicker · ☐ open invite via number · ☐ open no contact permission · ☐ open number picker · ☐ open simple · ☐ pay offer details
- *inapp_token*: ☐ inapp token otp · ☐ inapp token otp stepup
- *inapp_token_v2/widget*: ☐ inapp token v2 error · ☐ inapp token v2 resend otp
- *max/amount_entry*: ☐ max amount screen more
- *mint/bottom_sheets*: ☐ expanded info · ☐ open scrollable
- *mint/coin_burn*: ☐ invitee details · ☐ open invitee details
- *mint/commons*: ☐ mint faq · ☐ mint ll know more · ☐ mint ll plans
- *mint/invite*: ☐ mint invite via number · ☐ mint whatsapp
- *mint/ntu_onboarding*: ☐ mint ntu onboarding knowmore
- *mint/withdraw*: ☐ mint withdraw amount entry · ☐ mint withdraw graph
- *mint_ask_invite*: ☐ ask all for invite · ☐ mint invite success
- *mint_slider*: ☐ know more
- *mint_withdraw*: ☐ withdraw graph
- *money/bank_summary*: ☐ bank summary edit account number
- *money/common*: ☐ money generic
- *money/in_and_out*: ☐ in and out recurring
- *money/key_updates*: ☐ money recommended rp
- *money/recurring_payment_history*: ☐ money rec payment history
- *money/transaction_edit_note*: ☐ money transaction edit note
- *money/transaction_filters*: ☐ money transaction filters multi select
- *money/transactions*: ☐ money transaction history
- *p2p/self_transfer*: ☐ retry
- *p2p/transaction_history*: ☐ p2p profile
- *pay/bbps*: ☐ alert · ☐ draft dismiss · ☐ manage · ☐ pay error
- *ppi_wallet/commons*: ☐ ppi wallet error
- *ppi_wallet/home*: ☐ ppi risk blocked upgrade · ☐ ppi wallet home offer info · ☐ ppi wallet strip offer info · ☐ ppi wallet user education
- *ppi_wallet/home_settings*: ☐ ppi wallet home settings
- *ppi_wallet/inflight_topup*: ☐ ppi wallet inflight topup
- *ppi_wallet/onboarding*: ☐ agent not available · ☐ pan correction · ☐ ppi wallet nominee salutation · ☐ select kyc confirmation
- *ppi_wallet/ppi_wallet_profile*: ☐ ppi custom vpa succes info
- *ppi_wallet/rekyc*: ☐ rekyc confirm address · ☐ rekyc nudge · ☐ rekyc option picker · ☐ rekyc pac confirm
- *ppi_wallet/streak*: ☐ ppi wallet animated
- *ppi_wallet/transfers*: ☐ ppi wallet transfers vpa blocking · ☐ ppi wallet upi onboarding crossell
- *receive_money_flow_reward*: ☐ receive money flow reward balance error
- *scan_and_pay/commons*: ☐ snp nudge
- *scan_and_pay/custom_vpa*: ☐ custom vpa succes info
- *scan_and_pay/mandate_checkout*: ☐ mandate checkout · ☐ mandate error · ☐ mandate offer intercept · ☐ mandate offer tnc · ☐ mandate offers
- *scan_and_pay/more_info*: ☐ more info
- *store*: ☐ order tracking history
- *store/orders*: ☐ cancel return ack
- *unbundling*: ☐ unbundling generic
- *universal_search*: ☐ universal search clear recent
- *upi_number_mapper*: ☐ upin error · ☐ upin select primary
- *win/pop_game*: ☐ pop game modal


## CRED cash / lending
`lending` · 22 screens · 64 sheets

**Screens**

- *cash/line_management_v2*: ☐ line v2
- *cash/loan_summary*: ☐ cash loan summary
- *cash/section_screen*: ☐ cash section
- *common/error*: ☐ lending error full
- *common/loan_summary_v2*: ☐ lending loan summary v2
- *las*: ☐ las otp · ☐ las otp pitch
- *las/home*: ☐ las home
- *las/las_credit_limit*: ☐ las credit limit · ☐ las credit limit calculate · ☐ las credit limit offer · ☐ las credit limit polling
- *las/ltv*: ☐ las ltv home
- *las/pledge_management*: ☐ las unpledge
- *las/pledging*: ☐ las pledge otp
- *las/section_screen*: ☐ las section
- *lending_home/section_screen*: ☐ lending home section
- *lendx*: ☐ cashx amount tenure selection · ☐ cashx lender selection · ☐ cashx lender selection group · ☐ cashx loan summary v2 · ☐ cashx tenure selection

**Bottom sheets**

- *cash/line_management_v2*: ☐ cash line v2 lenders list · ☐ cash line v2 withdrawal status
- *cash/reverse_penny_drop*: ☐ cash rpd error · ☐ cash rpd pitch
- *cash/upgrade*: ☐ animated · ☐ upgrade modal
- *cash/upgrade_aa*: ☐ cash aa account selection · ☐ cash aa consent details · ☐ cash aa consent review · ☐ cash aa discovery · ☐ cash aa error · ☐ cash aa exit · ☐ cash aa intro · ☐ cash aa lender selection · ☐ cash aa modal · ☐ cash aa otp · ☐ cash aa unlocking · ☐ cash aa verification
- *common/bottomsheets*: ☐ lending documents · ☐ lending kyc pitch
- *common/error*: ☐ lending error
- *common/foreclosure*: ☐ lending foreclosure breakup · ☐ lending foreclosure form · ☐ lending foreclosure pitch
- *common/insurance_pitch*: ☐ lending insurance pitch
- *common/kfs_consent*: ☐ lending kfs consent
- *common/repayment*: ☐ lending loan custom repayment · ☐ lending repayment autopay · ☐ lending repayment break up
- *las/kyc_consent*: ☐ las kyc consent · ☐ las kyc consent dropdown edit · ☐ las kyc consent edit
- *las/las_bottomsheets*: ☐ las auto unpledge · ☐ las bank selection · ☐ las disbursal error · ☐ las disbursal status · ☐ las fund expansion · ☐ las fund value · ☐ las home screen · ☐ las in progress · ☐ las loan post repayment · ☐ las status card
- *las/ltv*: ☐ las ltv info · ☐ las mfc redirect pitch
- *las/overdue*: ☐ las overdue info
- *las/pledge_management*: ☐ las learn more · ☐ las pledge management · ☐ las unpledge pitch
- *las/pledging*: ☐ las pledging consent · ☐ las pledging failure · ☐ las pledging ineligible
- *las/reamortization*: ☐ las reamort input · ☐ las reamort summary
- *las/repeat_journey*: ☐ las minimal pledge · ☐ las pledging know more
- *lending_home/bottomsheets*: ☐ lending home active loans · ☐ lending home cross sell · ☐ lending home withdraw selection
- *lendx/bottomsheets*: ☐ cashx bank confirmation · ☐ cashx insurance pitch · ☐ cashx liveliness modal · ☐ cashx offer assessment modal · ☐ cashx offer upgrade pitch · ☐ pan input


## Rewards & games (coins, raffles, spins, mystery rewards)
`hooked` · 49 screens · 33 sheets

**Screens**

- *bills_cross_sell_bs*: ☐ bills cross sell
- *buzz_all*: ☐ buzz all
- *cause_rewards*: ☐ cause rewards · ☐ cause rewards campaign details · ☐ cause rewards certificate detail · ☐ cause rewards contribution success · ☐ cause rewards media gallery
- *choice_stack*: ☐ choice stack · ☐ choice stack empty carousel
- *coin_store*: ☐ coin store error
- *coin_store/l1*: ☐ win l1
- *daily_rewards*: ☐ daily rewards · ☐ daily rewards payment
- *fff/approver*: ☐ fastest finger first approver
- *fff/contact_book*: ☐ fastest finger first contact book
- *fff/game*: ☐ fastest finger first · ☐ fastest finger first you won
- *fff/winners*: ☐ fastest finger first winners home · ☐ fastest finger first winners list
- *generic_error_bs*: ☐ generic error bs
- *hidden_claim*: ☐ hidden claim
- *mystery_rewards*: ☐ mystery rewards · ☐ mystery rewards loading · ☐ mystery rewards success
- *mystery_rewards/us_stock*: ☐ us stock reward
- *power_spin*: ☐ power spin · ☐ power spin mega detail
- *raffles*: ☐ raffle my tickets · ☐ raffle overlay · ☐ raffles
- *raffles/utils*: ☐ raffle analytics
- *rally*: ☐ rally l1 · ☐ rally pledge success
- *redemptionScreen*: ☐ redemption screen
- *redemptionScreen/modules*: ☐ mega jackpot form · ☐ mega jackpot rewards · ☐ redemption core loop farm · ☐ redemption currency pills · ☐ redemption iab · ☐ redemption partner funded cb claim · ☐ redemption voucher animation · ☐ terminal
- *reward_choice_flow_game*: ☐ reward choice flow game
- *slot_machine*: ☐ slot machine
- *spin_the_wheel*: ☐ cd spin wheel
- *spin_the_wheel_v2*: ☐ cd spin wheel v2
- *unclaimed_cashback_popup*: ☐ unclaimed cashback popup
- *voucher_farm*: ☐ voucher farm
- *winner_board*: ☐ winner

**Bottom sheets**

- *action_gated_rewards/how_to_unlock_sheet*: ☐ agr how to unlock · ☐ bbps action gated reward · ☐ ccbp action gated reward · ☐ generic action gated reward · ☐ no state action gated reward · ☐ personalised action gated reward
- *app_rating*: ☐ five star rating
- *assured_vouchers*: ☐ assured voucher
- *bills_cross_sell_bs*: ☐ bills cross sell
- *cause_rewards/bottom_sheets*: ☐ cause rewards contribution tier selection · ☐ cause rewards onboarding
- *commons/bottom_sheet*: ☐ bottom
- *game_forms*: ☐ game form
- *raffles/bottom_sheets*: ☐ raffle all winners · ☐ raffle how to play · ☐ raffle know more · ☐ raffle ticket · ☐ raffle winners · ☐ raffle your tickets
- *rally*: ☐ rally invite · ☐ rally pledge confirm · ☐ rally refund mode · ☐ rally resolution · ☐ rally unlocked
- *redemptionScreen/modules*: ☐ mjp · ☐ redemption iab details · ☐ redemption iab pdp
- *voucher_farm/gift_cards*: ☐ mark as used
- *voucher_farm/power_spin_campaign*: ☐ power spin campaign details
- *voucher_farm/redemption_bottom_sheet*: ☐ redemption
- *voucher_farm/trophy_detail_bottom_sheet*: ☐ common details · ☐ trophy details
- *wallet_screen*: ☐ wallet expiry cashback


## Travel (flights, hotels, trips)
`travel_nexus` · 68 screens · 5 sheets

**Screens**

- *commons*: ☐ nexus error
- *flights/ancillary*: ☐ flights ancillary error · ☐ flights ancillary loader · ☐ flights meal ancillary · ☐ flights seat selection
- *flights/boarding_pass*: ☐ flights boarding pass
- *flights/booking_details*: ☐ flights booking details · ☐ flights booking details error
- *flights/booking_review*: ☐ flights booking review · ☐ flights booking review loading
- *flights/cancellation*: ☐ flights cancellation · ☐ flights cancellation selection · ☐ flights cancellation success
- *flights/commons*: ☐ flights action success
- *flights/edit_search*: ☐ flights edit search
- *flights/listing*: ☐ flights listing · ☐ flights listing empty · ☐ flights listing error · ☐ flights listing filter · ☐ flights listing intl rt · ☐ flights listing loading · ☐ flights listing one way · ☐ flights listing quick view · ☐ flights listing round trip
- *flights/perks*: ☐ flights amenities · ☐ flights baggage
- *flights/pps*: ☐ flights pps · ☐ flights pps error
- *flights/review*: ☐ flights journey overview · ☐ flights passenger · ☐ flights review · ☐ flights review error · ☐ flights review loading
- *flights/search_v2*: ☐ flights calendar · ☐ flights pax · ☐ flights search
- *flights/web_check_in*: ☐ flights web check in · ☐ flights web checkin loading
- *home*: ☐ home · ☐ home error · ☐ home loading
- *hotels/cancellation*: ☐ hotels cancellation · ☐ hotels cancellation success
- *hotels/collections*: ☐ hotels collection · ☐ hotels collection error · ☐ hotels collection loading
- *hotels/commons*: ☐ hotels
- *hotels/filters*: ☐ hotels filter
- *hotels/landing*: ☐ hotels search
- *hotels/listing*: ☐ hotels listing · ☐ hotels listing error · ☐ hotels listing loading
- *hotels/maps*: ☐ hotels map
- *hotels/pdp*: ☐ hotels gallery · ☐ hotels gallery singular view · ☐ hotels pdp · ☐ hotels pdp error · ☐ hotels pdp map · ☐ hotels reviews
- *hotels/room_listing*: ☐ hotels room listing · ☐ hotels room listing error · ☐ hotels room listing loading
- *my_trips*: ☐ my trips · ☐ my trips error · ☐ my trips loading
- *my_trips/my_bookings*: ☐ my bookings · ☐ my bookings error · ☐ my bookings loading

**Bottom sheets**

- *flights/commons*: ☐ flights suffix
- *flights/listing*: ☐ flights fare type
- *hotels/landing*: ☐ hotels calendar pax update
- *hotels/room_listing*: ☐ hotels room listing amenities · ☐ hotels room listing bed


## Credit card (pitch, onboarding, activation, rewards)
`credit_card` · 54 screens · 7 sheets

**Screens**

- *activation/physical*: ☐ cc physical activation confirm pin · ☐ cc physical activation error · ☐ cc physical activation explore rewards · ☐ cc physical activation landing · ☐ cc physical activation otp · ☐ cc physical activation pin · ☐ cc physical activation success
- *activation/virtual*: ☐ cc virtual activation confirm card details · ☐ cc virtual activation cross sell success · ☐ cc virtual activation error · ☐ cc virtual activation failure · ☐ cc virtual activation flipper message · ☐ cc virtual activation landing · ☐ cc virtual activation loading · ☐ cc virtual activation otp · ☐ cc virtual activation success · ☐ cc virtual activation success v2 · ☐ cc virtual activation upi
- *card_actions*: ☐ card actions
- *card_controls*: ☐ card controls
- *cross_sell_pitch*: ☐ cc cross sell pitch
- *first_n_actions*: ☐ first n actions
- *multi_offer_pitch*: ☐ cc multi offer pitch
- *onboarding/application_form*: ☐ application form · ☐ cc add address · ☐ cc form edit
- *onboarding/application_submitting*: ☐ cc application submitting
- *onboarding/error_screen*: ☐ cc application error
- *onboarding/pan*: ☐ cc pan verify
- *onboarding/under_review*: ☐ cc under review
- *onboarding/vkyc*: ☐ cc vkyc permission fetch · ☐ vkyc education · ☐ vkyc failure
- *pitch*: ☐ cc benefits · ☐ cc new pitch · ☐ cc new pitch know more · ☐ cc pitch · ☐ cc pitch v2 exclusive perks · ☐ cc pitch v2 multi rewards · ☐ cc pitch v2 overview · ☐ cc pitch v2 points redeem · ☐ cc pitch v2 scanner · ☐ cc pitch v2 simple display · ☐ cc savings pitch · ☐ cc waitlist
- *rewards/cred_balance_conversion*: ☐ cc cb conversion pitch · ☐ cc cb conversion result
- *rewards/farm*: ☐ cc rewards farm error · ☐ cc rewards farm loading · ☐ cc rewards farm success
- *rewards/ledger*: ☐ cc ledger error · ☐ cc ledger success

**Bottom sheets**

- *common/bottom_sheet*: ☐ bottom · ☐ flexible
- *onboarding/application_form*: ☐ cc search
- *onboarding/vkyc*: ☐ cc grant permission
- *rewards/cred_balance_conversion*: ☐ cc cb conversion container · ☐ cc cb conversion error
- *rewards/ledger*: ☐ cc ledger transaction detail


## Cards tab (card details, milestones, linked cards)
`card_management` · 32 screens · 12 sheets

**Screens**

- *bank_selection*: ☐ cm bank selection background · ☐ cm bank selection home · ☐ cm bank selection search
- *benefits_unlocked*: ☐ cm benefits unlocked base
- *card_benefits*: ☐ cm card benefits
- *card_benefits/card_benefits_details*: ☐ cm card benefits details
- *card_details*: ☐ cm card details
- *card_details_input*: ☐ cm card details input · ☐ cm card details input background · ☐ cm card details input fetch
- *card_details_v2*: ☐ card details v2
- *ccbp_mnv*: ☐ ccbp mnv
- *ccbp_multibill*: ☐ cm ccbp multibill
- *commons*: ☐ cm generic error · ☐ cm loading
- *home*: ☐ cm home
- *linked_card/confirmation_1*: ☐ cm linked card confirmation 1
- *linked_card/confirmation_2*: ☐ cm linked card confirmation 2
- *linked_card/edit*: ☐ cm linked card edit
- *linked_card/eligibility*: ☐ cm linked card eligibility
- *linked_card/management*: ☐ cm linked card management
- *linked_card/selection*: ☐ cm linked card selection
- *milestone/achieved_overlay*: ☐ cm achieved overlay
- *milestone/milestone_achieved*: ☐ cm milestone achieved
- *milestone/milestone_details*: ☐ cm milestone details
- *milestone/multiple_transactions_tagging*: ☐ multiple transaction tagging
- *milestone/transaction_tagging_bs*: ☐ transaction tagging bs
- *milestones_home*: ☐ cm milestones home
- *offer_card_1*: ☐ cm offer card 1
- *rewards_interstitial*: ☐ cm rewards interstitial
- *streaks_bs*: ☐ cm streaks bs
- *variant_selection_v2*: ☐ cm variant selection v2 success

**Bottom sheets**

- *card_remove_confirmation_bs*: ☐ card remove confirmation
- *card_setup*: ☐ cm card setup error · ☐ cm card setup morph
- *ccbp_payment_bs*: ☐ ccbp pay
- *common/bottom_sheet*: ☐ bottom
- *commons*: ☐ cm date confirmation · ☐ cm datepicker
- *mark_as_paid*: ☐ mark as paid cashback · ☐ mark as paid confirmation · ☐ mark as paid full paid
- *milestone/cm_milestones_updates_bs*: ☐ cm milestones updates
- *milestone/renewal_date_bs*: ☐ cm milestones renewal


## Insurance
`insurance` · 20 screens · 20 sheets

**Screens**

- *motor/commons*: ☐ mi error · ☐ mi loading
- *motor/inspection*: ☐ mi inspection preview carousel · ☐ mi inspection reminder bs
- *motor/kyc_doc_upload*: ☐ mi kyc doc upload bs
- *motor/masked_engine*: ☐ mi masked engine bs
- *motor/odometer_reading*: ☐ mi odometer reading bs
- *motor/payd_bs*: ☐ mi payd bs
- *motor/plan_comparison*: ☐ mi plan comparison bs
- *motor/pyp*: ☐ mi pyp · ☐ mi pyp confirmation bs · ☐ mi pyp edit bs
- *motor/quick_quotes*: ☐ mi idv slider bs · ☐ mi quick quotes
- *motor/saod_date_input*: ☐ mi saod bs · ☐ mi saod flow
- *motor/semi_onboarded_consent*: ☐ mi semi onboarded consent
- *motor/social_proofing*: ☐ trust · ☐ trust lottie
- *motor/talk_to_expert*: ☐ mi talk to expert

**Bottom sheets**

- *motor/commons*: ☐ mi list selector · ☐ mi not due · ☐ mi simple
- *motor/inspection*: ☐ mi inspection reminder
- *motor/kyc_doc_upload*: ☐ mi kyc doc upload
- *motor/masked_engine*: ☐ mi masked engine
- *motor/odometer_reading*: ☐ mi odometer reading
- *motor/payd_bs*: ☐ mi payd
- *motor/plan_comparison*: ☐ mi plan comparison
- *motor/policy_comparer*: ☐ mi policy comparer · ☐ mi policy comparer addon · ☐ mi policy comparer insurer selector
- *motor/pyp*: ☐ mi pyp
- *motor/quick_quotes*: ☐ mi quick quotes addon filter · ☐ mi quick quotes payd education · ☐ mi quick quotes prev add on · ☐ mi quick quotes select idv
- *motor/saod_date_input*: ☐ mi saod where to find
- *motor/semi_onboarded_consent*: ☐ mi semi onboarded consent · ☐ mi semi onboarded consent policies


## Login, sign-up & growth
`growth` · 32 screens · 5 sheets

**Screens**

- *fraud_app_scanner*: ☐ fraud app scanner empty · ☐ fraud app scanner error · ☐ fraud app scanner scan
- *login/otp_verification*: ☐ otp
- *login/permission*: ☐ permission
- *login/phone_input*: ☐ mobile
- *login/shared*: ☐ login wrapper
- *new_feature_discovery*: ☐ new feature discovery artifact
- *onboarding/platform*: ☐ add card · ☐ add card luhn · ☐ card verification · ☐ cards biils preview intro · ☐ cards biils preview outro · ☐ cred protect · ☐ cupi · ☐ cupi edit mobile · ☐ eligibility · ☐ email · ☐ membership setup completion · ☐ membership success · ☐ multi bank cupi · ☐ multi sim selection · ☐ pan dob · ☐ profile · ☐ reward preferences · ☐ sim selection · ☐ waitlisted native
- *zombie_welcome*: ☐ zombie welcome accounts · ☐ zombie welcome currency · ☐ zombie welcome error · ☐ zombie welcome intro · ☐ zombie welcome score

**Bottom sheets**

- *login*: ☐ login error
- *onboarding/platform*: ☐ waitlisted native actions · ☐ waitlisted native add interest
- *onboarding/shared*: ☐ animated · ☐ base animated


## Autopay
`autopay` · 19 screens · 16 sheets

**Screens**

- *autopay_interstitial*: ☐ autopay interstitial
- *ccbp_bbps_autopay_intercept_bs*: ☐ ccbp bbps autopay interstitial
- *fixed_amount_edit*: ☐ autopay preference fixed amount edit
- *fixed_topup_amount*: ☐ autopay preference fixed topup amount edit
- *instrument_selector/widget*: ☐ autopay instrument selector
- *know_more*: ☐ autopay know more
- *manage*: ☐ autopay manage settings · ☐ autopay management
- *mandates/details*: ☐ mandate details
- *mandates/listing*: ☐ mandate listing
- *mandates/operations*: ☐ approve mandate · ☐ cancel mandate · ☐ pause mandate · ☐ pre pause mandate
- *mandates/retention_pitch*: ☐ retention pitch
- *mandates/transfer*: ☐ mandate transfer
- *preferences*: ☐ autopay preference
- *setup*: ☐ autopay setup · ☐ autopay setup summary

**Bottom sheets**

- *autopay_interstitial*: ☐ autopay interstitial
- *ccbp_bbps_autopay_intercept_bs*: ☐ ccbp bbps autopay intercept
- *common*: ☐ inset
- *manage*: ☐ management details
- *mandates/common*: ☐ mandate stacked · ☐ secure upi
- *mandates/history*: ☐ mandate history
- *mandates/listing*: ☐ decline mandate · ☐ mandate all autopays
- *mandates/operations*: ☐ mandate ops result
- *mandates/transfer*: ☐ mandate transfer · ☐ mandate transfer empty banks · ☐ mandate transfer error · ☐ mandate transfer how it works · ☐ mandate transfer no autopay · ☐ mandate transfer success


## Credit score
`credit_score` · 15 screens · 17 sheets

**Screens**

- *accountslisting*: ☐ account listing
- *alerts*: ☐ alerts
- *common*: ☐ credit score error
- *compass*: ☐ compass goals
- *contacts*: ☐ cs contacts bs
- *foresight*: ☐ foresight home
- *home*: ☐ home
- *key_factors*: ☐ key factors
- *loan_account*: ☐ loan details
- *manage_subscriptions*: ☐ manage subscriptions
- *milestones*: ☐ milestone details · ☐ milestones
- *onboarding*: ☐ onboarding pitch
- *premium_walkthrough*: ☐ premium walkthrough
- *purchase*: ☐ purchase

**Bottom sheets**

- *alert_sharing*: ☐ alert sharing member select · ☐ share preferences · ☐ stop sharing
- *alerts*: ☐ alert details
- *compass*: ☐ compass goals suggestions · ☐ compass score selector
- *contacts*: ☐ cs contacts · ☐ cs contacts bs ineligible
- *emergency_contact*: ☐ emergency confirmation
- *foresight/foresight_action_bottom_sheets*: ☐ foresight action
- *home*: ☐ cs plus intercept · ☐ plan switch success · ☐ refresh available
- *home/builder*: ☐ credit summary
- *manage_subscriptions*: ☐ plan listing · ☐ plan upgrade explainer
- *onboarding*: ☐ onboarding consent


## Pay tab, bills & recharges
`paytab_v3` · 13 screens · 19 sheets

**Screens**

- *commons/error_logging*: ☐ paytab error
- *mobile_recharge/home*: ☐ mr home page
- *mobile_recharge/plan_catalog*: ☐ mr plan catalog
- *mobile_recharge/plan_customization*: ☐ mr plan customization
- *mobile_recharge/plan_details_sheet*: ☐ mr plan details sheet
- *mobile_recharge/search*: ☐ mr search
- *mobile_recharge/smarter_similar*: ☐ mr smarter similar
- *paytab/add_bill*: ☐ add bill
- *paytab/all_bills*: ☐ paytab all bills
- *paytab/all_categories*: ☐ all categories
- *paytab/delete_bills*: ☐ delete bills sheet
- *paytab/home*: ☐ paytab home
- *paytab/onboarding*: ☐ paytab onboarding flow

**Bottom sheets**

- *manage_bs/common*: ☐ manage bs bill details
- *manage_bs/manage_sheet*: ☐ manage bs add alias · ☐ manage bs confirmation · ☐ manage bs dismiss options
- *mobile_recharge/common*: ☐ mr add favourite · ☐ mr onboarding
- *mobile_recharge/plan_catalog*: ☐ mr all filters
- *mobile_recharge/repeat_recharge*: ☐ mr repeat recharge
- *paytab/add_bill*: ☐ dropdown picker · ☐ morph · ☐ view sample
- *paytab/commons*: ☐ paytab · ☐ paytab alfred error
- *paytab/delete_bills*: ☐ delete bills · ☐ delete confirm
- *paytab/onboarding*: ☐ paytab onboarding bill list · ☐ paytab onboarding flow · ☐ paytab onboarding intro · ☐ paytab onboarding processing


## Checkout (v2)
`checkout_v2` · 25 screens · 4 sheets

**Screens**

- *add_card*: ☐ card · ☐ cvv
- *breakup_bs*: ☐ checkout breakup bs
- *card_tokenisation*: ☐ card tokenisation · ☐ card tokenisation error · ☐ card tokenisation faq
- *confirmation*: ☐ checkout confirmation
- *cross_sell/details*: ☐ checkout cross sell details bs
- *cross_sell/hard_nudge*: ☐ checkout cross sell hard nudge
- *cross_sell/intro*: ☐ checkout cross sell hard pitch intro
- *error*: ☐ checkout error
- *error_nba*: ☐ error nba
- *exit_intercept*: ☐ checkout exit intercept
- *footer_nudge_info_bs*: ☐ footer nudge bs
- *generic_bs*: ☐ checkout generic bs
- *in_app_onboarding*: ☐ card in app onboarding
- *inline_autopay/preferences*: ☐ autopay preference
- *offer_intercept*: ☐ offer intercept · ☐ offer intercept success
- *offers*: ☐ checkout offers
- *reco*: ☐ checkout reco
- *rupay_pitch*: ☐ checkout rupay pitch
- *star_wars*: ☐ checkout exit intercept star wars feedback
- *upi/bio_auth_setup_success*: ☐ bio auth setup success
- *view_all*: ☐ view all instrument

**Bottom sheets**

- *inline_autopay*: ☐ checkout autopay inline hard nudge
- *magic_pay/magic_pay_disable_bs*: ☐ magic pay disable
- *reward*: ☐ reward intro
- *status_info*: ☐ status info


## Gold & silver
`gold` · 9 screens · 19 sheets

**Screens**

- *address*: ☐ gold address
- *coin_pdp*: ☐ gold coin pdp
- *coin_redemption*: ☐ gold coin redemption
- *home*: ☐ gold asset container · ☐ gold home
- *sip_details*: ☐ gold sip details
- *sip_listing*: ☐ gold sip listing
- *transaction_details*: ☐ gold transaction details
- *transactions*: ☐ gold transactions

**Bottom sheets**

- *buy_one_time*: ☐ gold buy one time
- *coin_pdp*: ☐ gold coin summary
- *common*: ☐ gold instrument selector · ☐ gold options
- *holding*: ☐ gold holding
- *home*: ☐ gold home header · ☐ gold intro
- *multi_buy*: ☐ gold multi buy · ☐ gold multi buy breakdown
- *offers*: ☐ gold offers
- *pan_verification*: ☐ gold pan verification
- *sell*: ☐ gold sell · ☐ gold sell breakdown
- *sip*: ☐ gold monthly date selector · ☐ gold sip
- *sip_details*: ☐ gold sip details options
- *tnc*: ☐ gold tnc
- *upgrade_sip*: ☐ gold upgrade sip · ☐ gold upgrade sip disclaimer


## Net worth & investments
`networth` · 9 screens · 17 sheets

**Screens**

- *common*: ☐ networth error
- *device_binding*: ☐ device binding
- *epf/epf_calculator*: ☐ epf calculator
- *onboarding/intro*: ☐ asset selection · ☐ intro · ☐ onboarding
- *onboarding/notify*: ☐ onboarding notify me
- *sgb/sgb_intro*: ☐ sgb intro
- *sgb/sgb_status*: ☐ sgb status

**Bottom sheets**

- *common*: ☐ draggable · ☐ networth generic
- *common/asset_details*: ☐ asset details
- *epf/epf_home*: ☐ revoke consent · ☐ revoke consent confirmation
- *epf/epf_onboarding*: ☐ epf info · ☐ epf loading
- *mutual_funds/mutual_funds_details*: ☐ mutual funds details
- *mutual_funds/mutual_funds_home*: ☐ mutual funds otp · ☐ mutual funds sort
- *networth_general_bs*: ☐ networth general
- *networth_interjection*: ☐ networth interjection
- *sgb/sgb_intro*: ☐ sgb add email
- *stocks/stocks_details*: ☐ stock details
- *stocks/stocks_home*: ☐ stocks sort
- *us_stocks/holding_detail*: ☐ holding detail
- *us_stocks/us_stocks_home*: ☐ us stocks sort


## Dining
`dining` · 11 screens · 9 sheets

**Screens**

- *booking*: ☐ booking bs
- *booking_details*: ☐ booking details
- *bookings_history*: ☐ bookings history bs
- *listing*: ☐ listing
- *location_selector*: ☐ location selector bs
- *navigation*: ☐ dining host
- *pay_bill_bs*: ☐ pay bill bs
- *restaurant_detail*: ☐ restaurant detail · ☐ restaurant gallery
- *review_booking*: ☐ review booking
- *search_restaurants*: ☐ search bs

**Bottom sheets**

- *booking*: ☐ booking unavailable
- *booking_details/sheets*: ☐ cancel booking
- *common*: ☐ dining floating · ☐ dining templated · ☐ outlet switcher · ☐ timings
- *listing*: ☐ listing filters · ☐ listing pass
- *pay_bill_bs*: ☐ pay bill breakdown


## Checkout (v3)
`checkout_v3` · 13 screens · 4 sheets

**Screens**

- *breakup_bs*: ☐ checkout breakup bs v3
- *card*: ☐ card v3 · ☐ cvv v3
- *error*: ☐ checkout error v3
- *error_nba*: ☐ error nba bs v3
- *exit_intercept*: ☐ checkout exit intercept v3
- *farm_v3*: ☐ farm v3
- *generic_bs*: ☐ checkout generic bs v3
- *inline_autopay*: ☐ checkout autopay inline hard nudge v3
- *magic_pay*: ☐ magic pay v3
- *offer_intercept*: ☐ checkout offer intercept v3
- *offers*: ☐ offers v3
- *reco*: ☐ checkout reco v3

**Bottom sheets**

- *ui_kit*: ☐ bill breakup · ☐ inset · ☐ offer tnc · ☐ offers and rewards


## UPI onboarding
`upi_onboarding` · 15 screens · 0 sheets

**Screens**

- *base*: ☐ account fetching base · ☐ account linking payments base · ☐ account not found base · ☐ choose primary account base · ☐ generic error base · ☐ link and complete setup base · ☐ multi selection bank search base · ☐ partial linking base · ☐ phone number edit base · ☐ phone number selection base · ☐ send sms base · ☐ sim selection base · ☐ single selection bank search base · ☐ upi linking onb base
- *—*: ☐ upi linking onb


## Gift cards
`gift_card` · 10 screens · 1 sheets

**Screens**

- *detail*: ☐ gift card detail
- *farm*: ☐ farm
- *flash_sale*: ☐ flash sale l1
- *gc_campaign_farm*: ☐ gc campaign farm
- *generic_error_bs*: ☐ generic error bs
- *my_cards*: ☐ my cards · ☐ my cards details
- *pps*: ☐ gift card pps
- *search*: ☐ search
- *search_v2*: ☐ gc search

**Bottom sheets**

- *common*: ☐ redemption info


## Unbundling
`unbundling` · 6 screens · 5 sheets

**Screens**

- *consent_management/client_listing*: ☐ unbundling merchants · ☐ unbundling merchants list
- *consent_management/global_consent_details*: ☐ global consent
- *consent_management/initial*: ☐ initial
- *consent_management/no_cards*: ☐ unbundling no cards error
- *consent_management/no_consent_onboarding*: ☐ no consent onboarding

**Bottom sheets**

- *consent_management/client_consent_details*: ☐ client consent detail
- *consent_management/common*: ☐ unbundling common
- *consent_management/intercepts*: ☐ unbundling deactivate intercept · ☐ unbundling disable intercept
- *consent_management/view_all*: ☐ unbundling view all instruments


## Security & biometrics
`cupid_ui` · 6 screens · 4 sheets

**Screens**

- *bio_auth_blocker*: ☐ bio auth blocker
- *bio_auth_pitch*: ☐ bio auth pitch
- *manage_bio_auth*: ☐ manage bio auth
- *setup_bio_auth*: ☐ setup bio auth
- *setup_bio_auth/account_selection*: ☐ setup bio auth acc selection
- *setup_bio_auth/setup_complete*: ☐ setup complete

**Bottom sheets**

- *manage_bio_auth*: ☐ biometric enrollment changed · ☐ disable bio auth
- *setup_bio_auth/generic_bs*: ☐ generic response
- *setup_bio_auth/setup_complete*: ☐ cashback


## Home, search & More tab
`central_experience` · 7 screens · 1 sheets

**Screens**

- *home/biller*: ☐ biller bs base builder
- *home/bills_offer_discovery_bs*: ☐ offer detail bs
- *home/landing*: ☐ home landing · ☐ home search
- *partner_apps*: ☐ partner apps sheet
- *pinnacle*: ☐ pinnacle items
- *profile_v4*: ☐ profile v4

**Bottom sheets**

- *home/cards_top_sheet*: ☐ home cm top


## Shared UI (design system)
`cred_ui` · 0 screens · 6 sheets

**Bottom sheets**

- *bottom_sheet_neopop*: ☐ material
- *date_picker*: ☐ date picker
- *header_bottom_sheet*: ☐ custom · ☐ custom standard · ☐ header
- *number_picker*: ☐ number picker


## KYC
`kyc_ui_cred` · 0 screens · 6 sheets

**Bottom sheets**

- *chrome*: ☐ cred kyc
- *shared*: ☐ cred edit field · ☐ cred exit confirm · ☐ cred help · ☐ cred link
- *steps/generic_form*: ☐ cred selection


## Transaction history
`unified_transactions_history` · 1 screens · 5 sheets

**Screens**

- *—*: ☐ unified transactions history

**Bottom sheets**

- *bottom_sheets*: ☐ date range filter · ☐ download statement · ☐ download statement status · ☐ filters · ☐ quick filter


## Fixed deposits
`fixed_deposit` · 3 screens · 2 sheets

**Screens**

- *details*: ☐ fixed deposit details
- *home*: ☐ fixed deposit home
- *listing*: ☐ fixed deposit listing

**Bottom sheets**

- *common/filter*: ☐ fixed deposit filter
- *details/rates_sheet*: ☐ fixed deposit rates


## Card tokenisation
`tokenisation` · 2 screens · 3 sheets

**Screens**

- *cardAltAuthManage*: ☐ card alt auth manage
- *commons/error_logging*: ☐ tokenisation error

**Bottom sheets**

- *common*: ☐ bottom
- *inappTokenScf/failure*: ☐ failure
- *inappTokenScf/resend_otp*: ☐ inapp scf resend otp


## Bank balance & history
`balance_and_history` · 3 screens · 1 sheets

**Screens**

- *—*: ☐ balance and history · ☐ balance and history error · ☐ balance and history success

**Bottom sheets**

- *—*: ☐ balance and history check balance error


## Multiple bills
`multi_bill` · 2 screens · 1 sheets

**Screens**

- *bills_selection*: ☐ mb bill selection
- *intro*: ☐ mb intro

**Bottom sheets**

- *bills_selection*: ☐ mb bill summary


## Pay success / rewards (PPS)
`pps_v3` · 0 screens · 3 sheets

**Bottom sheets**

- *bottom_sheet*: ☐ pps v3 check balance intercept · ☐ pps v3 more info · ☐ pps v3 screenshot intercept


## Redemption
`redemption_v2` · 2 screens · 0 sheets

**Screens**

- *—*: ☐ redemption home · ☐ voucher animation

## Native Android screens (activities)

☐ ArticleDetailActivity · ☐ ArticleListActivity · ☐ AutocompleteActivity · ☐ BotFaqDetailsActivity · ☐ CREDAccessAuthActivity · ☐ CategoryListActivity · ☐ ChallengeHtmlActivity · ☐ ChallengeNativeActivity · ☐ ChannelListActivity · ☐ ConversationDetailActivity · ☐ CredFlutterActivity · ☐ CredJustPaySafeActivity · ☐ CredOAuthActivity · ☐ CredPayGatewayActivity · ☐ CropActivity · ☐ CustomtabActivity · ☐ DeeplinkActivity · ☐ DeeplinkInterstitialActivity · ☐ FAQCategoriesActivity · ☐ FAQDetailsActivity · ☐ FAQListActivity · ☐ FAQSearchActivity · ☐ FallbackActivity · ☐ GenericIdpActivity · ☐ GoogleApiActivity · ☐ HVConsentActivity · ☐ HVDocReviewActivity · ☐ HVDocsActivity · ☐ HVFaceActivity · ☐ HVFaceInstructionActivity · ☐ HVQRScannerActivityInternal · ☐ HVRetakeActivity · ☐ HiddenActivity · ☐ InterstitialActivity · ☐ MinkasuSDKActivity · ☐ OAuthDeeplinkActivity · ☐ PayWithCredActivity · ☐ PaymentActivity · ☐ PaymentStatusActivity · ☐ PhoenixActivity · ☐ PictureAttachmentActivity · ☐ PlayCoreDialogWrapperActivity · ☐ PreviewActivity · ☐ RecaptchaActivity · ☐ SafeBrowserContainerActivity · ☐ SignInHubActivity · ☐ SnakeActivity · ☐ UPIActivity · ☐ UnBundlingActivity · ☐ UnderMaintenanceActivity · ☐ UpiBioAuthIntentActivity · ☐ UpiInstrumentIntentActivity · ☐ UpiIntentActivity · ☐ UpswingActivity · ☐ UserAuthInfoActivity · ☐ WebViewActivity
