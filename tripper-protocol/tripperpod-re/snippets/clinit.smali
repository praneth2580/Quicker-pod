.field public static final SCREEN_ARRIVE:B = 0x15t

.field public static final SCREEN_HIGHWAY:B = 0x32t

.field public static final SCREEN_IDLE:B = 0x3ct

.field public static final SCREEN_LAST:B = 0x1t

.field public static final SCREEN_RECALC:B = 0x3dt

.field public static final SCREEN_STOP:B = 0x1ct

.field public static final SCREEN_TBT:B = 0x14t

.field private static final SERVICE_UUID:Ljava/util/UUID;

.field private static final WRITE_CHAR_UUID:Ljava/util/UUID;


# direct methods
.method static constructor <clinit>()V
    .locals 2

    new-instance v0, Lcom/supertripper/app/TripperProtocol;

    invoke-direct {v0}, Lcom/supertripper/app/TripperProtocol;-><init>()V

    sput-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    const-string v1, "01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0"

    invoke-static {v1}, Ljava/util/UUID;->fromString(Ljava/lang/String;)Ljava/util/UUID;

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->SERVICE_UUID:Ljava/util/UUID;

    const-string v1, "01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0"

    invoke-static {v1}, Ljava/util/UUID;->fromString(Ljava/lang/String;)Ljava/util/UUID;

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->WRITE_CHAR_UUID:Ljava/util/UUID;

    const-string v1, "00002902-0000-1000-8000-00805f9b34fb"

    invoke-static {v1}, Ljava/util/UUID;->fromString(Ljava/lang/String;)Ljava/util/UUID;

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->CCCD_UUID:Ljava/util/UUID;

    const-string v1, "21010000000000000000000000000000000050A7"

    invoke-direct {v0, v1}, Lcom/supertripper/app/TripperProtocol;->hex(Ljava/lang/String;)[B

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->PKT_PIN_SHOW:[B

    const-string v1, "2100000000000000000000000000000000004045"

    invoke-direct {v0, v1}, Lcom/supertripper/app/TripperProtocol;->hex(Ljava/lang/String;)[B

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->PKT_CLOSE:[B

    const-string v1, "03000000000000000000000000000000000045D9"

    invoke-direct {v0, v1}, Lcom/supertripper/app/TripperProtocol;->hex(Ljava/lang/String;)[B

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->PKT_PING_FW:[B

    const-string v1, "300000000000000000000000000000000000428B"

    invoke-direct {v0, v1}, Lcom/supertripper/app/TripperProtocol;->hex(Ljava/lang/String;)[B

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->PKT_PING_WP:[B

    const-string v1, "10111C00000100FF00000000000000000000F782"

    invoke-direct {v0, v1}, Lcom/supertripper/app/TripperProtocol;->hex(Ljava/lang/String;)[B

    move-result-object v1

    sput-object v1, Lcom/supertripper/app/TripperProtocol;->PKT_STOP_NAV:[B

    const-string v1, "10113C0000044015000041000403000000001050"

    invoke-direct {v0, v1}, Lcom/supertripper/app/TripperProtocol;->hex(Ljava/lang/String;)[B

    move-result-object v0

    sput-object v0, Lcom/supertripper/app/TripperProtocol;->PKT_NAV_IDLE:[B

    const/16 v0, 0x8

    sput v0, Lcom/supertripper/app/TripperProtocol;->$stable:I

    return-void
.end method

.method private constructor <init>()V
    .locals 0

