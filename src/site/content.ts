/** Shared marketing copy — keep FAQ / install / comparison in sync across SEO pages. */

export const WHY = [
  {
    title: "Pair like the official app",
    description:
      "Android hosts the phone-side GATT server so PIN auth and handshake work with real Tripper hardware.",
  },
  {
    title: "Maps turns on the pod",
    description:
      "Mirror Google Maps navigation notifications into Tripper turn packets — keep your eyes on the road.",
  },
  {
    title: "Open and free",
    description:
      "No account wall, no store fee. Every APK ships from GitHub Releases so you can verify build and source together.",
  },
] as const;

export const INSTALL_STEPS = [
  {
    n: "01",
    title: "Download the APK",
    body: "Use Download APK on the home page, or grab quicker-pod-<version>.apk from the latest GitHub Release.",
  },
  {
    n: "02",
    title: "Install",
    body: "Open the file on Android. If Play Protect blocks with “sensitive data”, use adb install or tap Install anyway — one APK includes pairing and Maps mirroring.",
  },
  {
    n: "03",
    title: "Pair & navigate",
    body: "Connect your Tripper, allow Notification access (and Restricted settings if prompted), then start Maps turn-by-turn.",
  },
] as const;

export const FAQ = [
  {
    question: "Why download an APK instead of using the website?",
    answer:
      "Full Tripper pairing and Maps mirroring need the phone to act as a BLE GATT server and read navigation notifications. Browsers cannot do that. The Android APK can.",
  },
  {
    question: "Play Protect says the app can access sensitive data — what do I do?",
    answer:
      "That warning appears because Quicker-pod reads Maps notifications to drive the pod. Install with: adb install quicker-pod-<version>.apk — or choose Install anyway. After install, open App info → Allow restricted settings, then enable Notification access.",
  },
  {
    question: "Does it work with Google Maps?",
    answer:
      "Yes. Enable notification access for Quicker-pod, connect your Tripper, then start Maps turn-by-turn. Turns and distance are mirrored to the pod.",
  },
  {
    question: "Is Quicker-pod a SuperTripper / Super TripperPod alternative?",
    answer:
      "Yes. Quicker-pod is a free, open-source Android companion for the Royal Enfield Tripper Pod that targets the same RE_DISP hardware path many riders use with SuperTripper. Download the APK from GitHub Releases — no account wall or store fee. Quicker-pod is not affiliated with SuperTripper or Royal Enfield.",
  },
  {
    question: "Does Quicker-pod work with Royal Enfield Tripper Pod?",
    answer:
      "Yes. Quicker-pod pairs over BLE with Tripper Pod displays (RE_DISP), runs the phone-side handshake, and mirrors Google Maps navigation turns onto the pod.",
  },
  {
    question: "Is the APK signed for Play Store?",
    answer:
      "Community builds are signed for sideloading from GitHub Releases. Enable install from unknown sources. You can always build from source.",
  },
  {
    question: "How do new APKs get published?",
    answer:
      "Maintainers run npm run deploy:app. That asks major/minor, builds the APK, uploads it to a GitHub Release, and refreshes the landing download link.",
  },
] as const;

export const COMPARISON_ROWS = [
  {
    label: "Price",
    quicker: "Free APK from GitHub Releases",
    superTripper: "Third-party paid / store listing (varies)",
  },
  {
    label: "Source code",
    quicker: "Open source — inspect and build yourself",
    superTripper: "Closed source",
  },
  {
    label: "Royal Enfield Tripper Pod",
    quicker: "BLE pairing + navigation mirroring",
    superTripper: "BLE pairing + navigation bridging",
  },
  {
    label: "Google Maps turns on the pod",
    quicker: "Yes — notification mirroring",
    superTripper: "Yes — navigation bridge",
  },
  {
    label: "Account required",
    quicker: "No",
    superTripper: "Depends on app version / distribution",
  },
  {
    label: "Distribution",
    quicker: "Sideload APK (GitHub Releases)",
    superTripper: "App store / developer distribution",
  },
] as const;
