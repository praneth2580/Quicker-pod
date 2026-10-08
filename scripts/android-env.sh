# Shared Android/JDK env for Gradle builds (source from other scripts).
# Capacitor 7 requires JDK 21 — "invalid source release: 21" means the wrong JDK was used.

export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

if [[ -z "${JAVA_HOME:-}" ]]; then
  for candidate in \
    /usr/lib/jvm/java-21-openjdk-amd64 \
    /usr/lib/jvm/java-21-openjdk \
    /usr/lib/jvm/java-21 \
    "$HOME/.sdkman/candidates/java/current"
  do
    if [[ -x "$candidate/bin/javac" ]]; then
      export JAVA_HOME="$candidate"
      break
    fi
  done
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "error: JAVA_HOME is unset and JDK 21 was not found." >&2
  echo "  Install openjdk-21 and/or: export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64" >&2
  exit 1
fi

# Ensure this JDK wins over a newer Studio JBR or older system default on PATH
export PATH="$JAVA_HOME/bin:$PATH"

java_ver="$(java -version 2>&1 | head -1 || true)"
if ! java -version 2>&1 | grep -qE '"21[\."]'; then
  echo "error: JDK 21 required for Capacitor Android builds (got: $java_ver)" >&2
  echo "  JAVA_HOME=$JAVA_HOME" >&2
  exit 1
fi

# ~/.gradle/gradle.properties can set org.gradle.java.home, and that value
# outranks both JAVA_HOME and this project's gradle.properties. Capacitor 7
# compiles with source release 21, so a JDK 17 pin fails with
# "invalid source release: 21". A -D system property outranks the user file.
case "${GRADLE_OPTS:-}" in
  *-Dorg.gradle.java.home=*) ;;
  *)
    export GRADLE_OPTS="${GRADLE_OPTS:+$GRADLE_OPTS }\"-Dorg.gradle.java.home=${JAVA_HOME}\""
    ;;
esac
