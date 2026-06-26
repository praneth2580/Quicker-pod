.class public final Lcom/supertripper/app/TripperProtocol;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/supertripper/app/TripperProtocol$GoogleManeuver;,
        Lcom/supertripper/app/TripperProtocol$TripperResponse;
    }
.end annotation

.annotation runtime Lkotlin/Metadata;
    d1 = {
        "\u0000R\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u0004\n\u0002\u0010\u0005\n\u0002\u0008\u0008\n\u0002\u0010\u000e\n\u0002\u0008\n\n\u0002\u0010\u0012\n\u0002\u0008\u001e\n\u0002\u0010\u0007\n\u0002\u0008\u0003\n\u0002\u0010\u000b\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0008\n\u0002\u0008\u0015\n\u0002\u0018\u0002\n\u0002\u0008\u0007\u0008\u00c7\u0002\u0018\u00002\u00020\u0001:\u0002`aB\u0007\u0008\u0002\u00a2\u0006\u0002\u0010\u0002J\u0010\u00108\u001a\u00020\u001d2\u0006\u00109\u001a\u00020\u001dH\u0002J\u000e\u0010:\u001a\u00020\t2\u0006\u0010;\u001a\u00020<J\u0018\u0010=\u001a\u00020\u001d2\u0006\u0010>\u001a\u00020\t2\u0008\u0008\u0002\u0010?\u001a\u00020@J4\u0010A\u001a\u00020\u001d2\u0006\u0010B\u001a\u00020C2\u0006\u0010D\u001a\u00020E2\u0008\u0008\u0002\u0010F\u001a\u00020\t2\u0008\u0008\u0002\u0010G\u001a\u00020\t2\u0008\u0008\u0002\u0010H\u001a\u00020\tJL\u0010I\u001a\u00020\u001d2\u0008\u0008\u0002\u0010F\u001a\u00020\t2\u0008\u0008\u0002\u0010D\u001a\u00020E2\u0008\u0008\u0002\u0010J\u001a\u00020\t2\u0008\u0008\u0002\u0010K\u001a\u00020\t2\u0008\u0008\u0002\u0010L\u001a\u00020\t2\u0008\u0008\u0002\u0010G\u001a\u00020\t2\u0008\u0008\u0002\u0010H\u001a\u00020\tJ\u000e\u0010M\u001a\u00020\u001d2\u0006\u0010N\u001a\u00020\u0012J\u0006\u0010O\u001a\u00020\u001dJ \u0010P\u001a\u00020\u001d2\u0006\u0010Q\u001a\u00020E2\u0006\u0010R\u001a\u00020E2\u0008\u0008\u0002\u0010S\u001a\u00020@J\u000e\u0010T\u001a\u00020E2\u0006\u0010U\u001a\u00020\u001dJ\u0010\u0010V\u001a\u00020\u001d2\u0006\u0010W\u001a\u00020\u0012H\u0002J\u000e\u0010X\u001a\u00020\u00122\u0006\u0010Y\u001a\u00020\tJ\u000e\u0010Z\u001a\u00020[2\u0006\u0010\\\u001a\u00020\u001dJ\u000e\u0010]\u001a\u00020\u00122\u0006\u0010Y\u001a\u00020\tJ\u000e\u0010^\u001a\u00020\u00122\u0006\u0010Y\u001a\u00020\tJ\u000e\u0010_\u001a\u00020\u00122\u0006\u0010\\\u001a\u00020\u001dR\u0019\u0010\u0003\u001a\n \u0005*\u0004\u0018\u00010\u00040\u0004\u00a2\u0006\u0008\n\u0000\u001a\u0004\u0008\u0006\u0010\u0007R\u000e\u0010\u0008\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\n\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000b\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000c\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\r\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000e\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000f\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0010\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0011\u001a\u00020\u0012X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0013\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0014\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0015\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0016\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0017\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0018\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0019\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u001a\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u001b\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u0011\u0010\u001c\u001a\u00020\u001d\u00a2\u0006\u0008\n\u0000\u001a\u0004\u0008\u001e\u0010\u001fR\u0011\u0010 \u001a\u00020\u001d\u00a2\u0006\u0008\n\u0000\u001a\u0004\u0008!\u0010\u001fR\u0011\u0010\"\u001a\u00020\u001d\u00a2\u0006\u0008\n\u0000\u001a\u0004\u0008#\u0010\u001fR\u0011\u0010$\u001a\u00020\u001d\u00a2\u0006\u0008\n\u0000\u001a\u0004\u0008%\u0010\u001fR\u0011\u0010&\u001a\u00020\u001d\u00a2\u0006\u0008\n\u0000\u001a\u0004\u0008\'\u0010\u001fR\u0011\u0010(\u001a\u00020\u001d\u00a2\u0006\u0008\n\u0000\u001a\u0004\u0008)\u0010\u001fR\u000e\u0010*\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010+\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010,\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010-\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010.\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010/\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u00100\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u00101\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u00102\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u00103\u001a\u00020\tX\u0086T\u00a2\u0006\u0002\n\u0000R\u0019\u00104\u001a\n \u0005*\u0004\u0018\u00010\u00040\u0004\u00a2\u0006\u0008\n\u0000\u001a\u0004\u00085\u0010\u0007R\u0019\u00106\u001a\n \u0005*\u0004\u0018\u00010\u00040\u0004\u00a2\u0006\u0008\n\u0000\u001a\u0004\u00087\u0010\u0007\u00a8\u0006b"
    }
    d2 = {
        "Lcom/supertripper/app/TripperProtocol;",
        "",
        "()V",
        "CCCD_UUID",
        "Ljava/util/UUID;",
        "kotlin.jvm.PlatformType",
        "getCCCD_UUID",
        "()Ljava/util/UUID;",
        "CMD_DEVICE_ID",
        "",
        "CMD_FUTURE_0B",
        "CMD_HANDSHAKE",
        "CMD_KEEPALIVE",
        "CMD_NAVIGATE",
        "CMD_PING_FW",
        "CMD_PING_WP",
        "CMD_SET_TIME",
        "DEVICE_NAME",
        "",
        "HS_CLOSE",
        "HS_SHOW_PIN",
        "MAN_FORWARD",
        "MAN_HIGHWAY",
        "MAN_LEFT",
        "MAN_RIGHT_HARD",
        "MAN_RIGHT_SOFT",
        "MAN_STRAIGHT",
        "MAN_UTURN",
        "PKT_CLOSE",
        "",
        "getPKT_CLOSE",
        "()[B",
        "PKT_NAV_IDLE",
        "getPKT_NAV_IDLE",
        "PKT_PING_FW",
        "getPKT_PING_FW",
        "PKT_PING_WP",
        "getPKT_PING_WP",
        "PKT_PIN_SHOW",
        "getPKT_PIN_SHOW",
        "PKT_STOP_NAV",
        "getPKT_STOP_NAV",
        "ROAD_AVENUE",
        "ROAD_HIGHWAY",
        "ROAD_STREET",
        "SCREEN_ARRIVE",
        "SCREEN_HIGHWAY",
        "SCREEN_IDLE",
        "SCREEN_LAST",
        "SCREEN_RECALC",
        "SCREEN_STOP",
        "SCREEN_TBT",
        "SERVICE_UUID",
        "getSERVICE_UUID",
        "WRITE_CHAR_UUID",
        "getWRITE_CHAR_UUID",
        "appendCrc",
        "buf",
        "bearingToDirection",
        "bearing",
        "",
        "buildCompassPacket",
        "direction",
        "nightMode",
        "",
        "buildNavFromManeuver",
        "gm",
        "Lcom/supertripper/app/TripperProtocol$GoogleManeuver;",
        "distMeters",
        "",
        "screen",
        "roadType",
        "etaMinutes",
        "buildNavPacket",
        "maneuver",
        "heading",
        "speedFlags",
        "buildPinPacket",
        "code",
        "buildSetTimeNowPacket",
        "buildSetTimePacket",
        "hour24",
        "minute",
        "is24h",
        "crc16",
        "data",
        "hex",
        "s",
        "maneuverLabel",
        "b",
        "parseResponse",
        "Lcom/supertripper/app/TripperProtocol$TripperResponse;",
        "bytes",
        "roadLabel",
        "screenLabel",
        "toHex",
        "GoogleManeuver",
        "TripperResponse",
        "app_release"
    }
    k = 0x1
    mv = {
        0x1,
        0x9,
        0x0
    }
    xi = 0x30
.end annotation


# static fields
.field public static final $stable:I

.field private static final CCCD_UUID:Ljava/util/UUID;

.field public static final CMD_DEVICE_ID:B = 0x20t

.field public static final CMD_FUTURE_0B:B = 0xbt

.field public static final CMD_HANDSHAKE:B = 0x21t

.field public static final CMD_KEEPALIVE:B = 0x40t

.field public static final CMD_NAVIGATE:B = 0x10t

.field public static final CMD_PING_FW:B = 0x3t

.field public static final CMD_PING_WP:B = 0x30t

.field public static final CMD_SET_TIME:B = 0x50t

.field public static final DEVICE_NAME:Ljava/lang/String; = "RE_DISP"

.field public static final HS_CLOSE:B = 0x0t

.field public static final HS_SHOW_PIN:B = 0x1t

.field public static final INSTANCE:Lcom/supertripper/app/TripperProtocol;

.field public static final MAN_FORWARD:B = 0x40t

.field public static final MAN_HIGHWAY:B = 0x60t

.field public static final MAN_LEFT:B = 0x10t

.field public static final MAN_RIGHT_HARD:B = 0x30t

.field public static final MAN_RIGHT_SOFT:B = 0x20t

.field public static final MAN_STRAIGHT:B = 0x0t

.field public static final MAN_UTURN:B = 0x50t

.field private static final PKT_CLOSE:[B

.field private static final PKT_NAV_IDLE:[B

.field private static final PKT_PING_FW:[B

.field private static final PKT_PING_WP:[B

.field private static final PKT_PIN_SHOW:[B

.field private static final PKT_STOP_NAV:[B

.field public static final ROAD_AVENUE:B = 0x42t

.field public static final ROAD_HIGHWAY:B = 0x31t

.field public static final ROAD_STREET:B = 0x41t

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

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method private final appendCrc([B)[B
    .locals 4

    new-instance v0, Lkotlin/ranges/IntRange;

    const/4 v1, 0x1

    const/4 v2, 0x0

    const/16 v3, 0x11

    invoke-direct {v0, v2, v3, v1}, Lkotlin/ranges/IntProgression;-><init>(III)V

    invoke-static {p1, v0}, Lkotlin/collections/c;->h0([BLkotlin/ranges/IntRange;)[B

    move-result-object v0

    invoke-virtual {p0, v0}, Lcom/supertripper/app/TripperProtocol;->crc16([B)I

    move-result v0

    shr-int/lit8 v1, v0, 0x8

    and-int/lit16 v1, v1, 0xff

    int-to-byte v1, v1

    const/16 v2, 0x12

    aput-byte v1, p1, v2

    and-int/lit16 v0, v0, 0xff

    int-to-byte v0, v0

    const/16 v1, 0x13

    aput-byte v0, p1, v1

    return-object p1
.end method

.method public static synthetic buildCompassPacket$default(Lcom/supertripper/app/TripperProtocol;BZILjava/lang/Object;)[B
    .locals 0

    and-int/lit8 p3, p3, 0x2

    if-eqz p3, :cond_0

    const/4 p2, 0x0

    :cond_0
    invoke-virtual {p0, p1, p2}, Lcom/supertripper/app/TripperProtocol;->buildCompassPacket(BZ)[B

    move-result-object p0

    return-object p0
.end method

.method public static synthetic buildNavFromManeuver$default(Lcom/supertripper/app/TripperProtocol;Lcom/supertripper/app/TripperProtocol$GoogleManeuver;IBBBILjava/lang/Object;)[B
    .locals 6

    and-int/lit8 p7, p6, 0x4

    if-eqz p7, :cond_0

    const/16 p3, 0x14

    :cond_0
    move v3, p3

    and-int/lit8 p3, p6, 0x8

    if-eqz p3, :cond_1

    const/16 p4, 0x41

    :cond_1
    move v4, p4

    and-int/lit8 p3, p6, 0x10

    if-eqz p3, :cond_2

    const/4 p5, 0x0

    :cond_2
    move v5, p5

    move-object v0, p0

    move-object v1, p1

    move v2, p2

    invoke-virtual/range {v0 .. v5}, Lcom/supertripper/app/TripperProtocol;->buildNavFromManeuver(Lcom/supertripper/app/TripperProtocol$GoogleManeuver;IBBB)[B

    move-result-object p0

    return-object p0
.end method

.method public static synthetic buildNavPacket$default(Lcom/supertripper/app/TripperProtocol;BIBBBBBILjava/lang/Object;)[B
    .locals 6

    and-int/lit8 p9, p8, 0x1

    if-eqz p9, :cond_0

    const/16 p1, 0x14

    :cond_0
    and-int/lit8 p9, p8, 0x2

    const/4 v0, 0x0

    if-eqz p9, :cond_1

    move p9, v0

    goto :goto_0

    :cond_1
    move p9, p2

    :goto_0
    and-int/lit8 p2, p8, 0x4

    const/16 v1, 0x40

    if-eqz p2, :cond_2

    move v2, v1

    goto :goto_1

    :cond_2
    move v2, p3

    :goto_1
    and-int/lit8 p2, p8, 0x8

    if-eqz p2, :cond_3

    move v3, v1

    goto :goto_2

    :cond_3
    move v3, p4

    :goto_2
    and-int/lit8 p2, p8, 0x10

    if-eqz p2, :cond_4

    const/16 p5, 0x15

    :cond_4
    move v4, p5

    and-int/lit8 p2, p8, 0x20

    if-eqz p2, :cond_5

    const/16 p6, 0x41

    :cond_5
    move v5, p6

    and-int/lit8 p2, p8, 0x40

    if-eqz p2, :cond_6

    goto :goto_3

    :cond_6
    move v0, p7

    :goto_3
    move-object p2, p0

    move p3, p1

    move p4, p9

    move p5, v2

    move p6, v3

    move p7, v4

    move p8, v5

    move p9, v0

    invoke-virtual/range {p2 .. p9}, Lcom/supertripper/app/TripperProtocol;->buildNavPacket(BIBBBBB)[B

    move-result-object p0

    return-object p0
.end method

.method public static synthetic buildSetTimePacket$default(Lcom/supertripper/app/TripperProtocol;IIZILjava/lang/Object;)[B
    .locals 0

    and-int/lit8 p4, p4, 0x4

    if-eqz p4, :cond_0

    const/4 p3, 0x1

    :cond_0
    invoke-virtual {p0, p1, p2, p3}, Lcom/supertripper/app/TripperProtocol;->buildSetTimePacket(IIZ)[B

    move-result-object p0

    return-object p0
.end method

.method private final hex(Ljava/lang/String;)[B
    .locals 5

    const-string v0, " "

    const-string v1, ""

    invoke-static {p1, v0, v1}, Lc5/j;->C(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p1}, Ljava/lang/String;->length()I

    move-result v0

    div-int/lit8 v0, v0, 0x2

    new-array v1, v0, [B

    const/4 v2, 0x0

    :goto_0
    if-ge v2, v0, :cond_0

    mul-int/lit8 v3, v2, 0x2

    add-int/lit8 v4, v3, 0x2

    invoke-virtual {p1, v3, v4}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object v3

    const-string v4, "substring(...)"

    invoke-static {v3, v4}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    const/16 v4, 0x10

    invoke-static {v4}, Lkotlin/text/a;->a(I)V

    invoke-static {v3, v4}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;I)I

    move-result v3

    int-to-byte v3, v3

    aput-byte v3, v1, v2

    add-int/lit8 v2, v2, 0x1

    goto :goto_0

    :cond_0
    return-object v1
.end method


# virtual methods
.method public final bearingToDirection(F)B
    .locals 1

    const/high16 v0, 0x41b40000    # 22.5f

    add-float/2addr p1, v0

    const/high16 v0, 0x43b40000    # 360.0f

    rem-float/2addr p1, v0

    const/high16 v0, 0x42340000    # 45.0f

    div-float/2addr p1, v0

    float-to-int p1, p1

    const/16 v0, 0x10

    packed-switch p1, :pswitch_data_0

    goto :goto_0

    :pswitch_0
    const/16 v0, 0x60

    goto :goto_0

    :pswitch_1
    const/16 v0, 0x30

    goto :goto_0

    :pswitch_2
    const/16 v0, -0x80

    goto :goto_0

    :pswitch_3
    const/16 v0, 0x40

    goto :goto_0

    :pswitch_4
    const/16 v0, 0x70

    goto :goto_0

    :pswitch_5
    const/16 v0, 0x20

    goto :goto_0

    :pswitch_6
    const/16 v0, 0x50

    :goto_0
    :pswitch_7
    return v0

    nop

    :pswitch_data_0
    .packed-switch 0x0
        :pswitch_7
        :pswitch_6
        :pswitch_5
        :pswitch_4
        :pswitch_3
        :pswitch_2
        :pswitch_1
        :pswitch_0
    .end packed-switch
.end method

.method public final buildCompassPacket(BZ)[B
    .locals 3

    const/16 v0, 0x14

    new-array v0, v0, [B

    const/4 v1, 0x0

    const/16 v2, 0x10

    aput-byte v2, v0, v1

    const/4 v1, 0x1

    const/16 v2, 0x11

    aput-byte v2, v0, v1

    const/4 v1, 0x2

    const/16 v2, 0x41

    aput-byte v2, v0, v1

    const/4 v1, 0x6

    aput-byte p2, v0, v1

    const/4 p2, 0x7

    const/4 v1, -0x1

    aput-byte v1, v0, p2

    const/16 p2, 0xb

    aput-byte v1, v0, p2

    const/16 p2, 0xc

    aput-byte v1, v0, p2

    const/16 p2, 0xd

    aput-byte v1, v0, p2

    const/16 p2, 0xe

    aput-byte p1, v0, p2

    invoke-direct {p0, v0}, Lcom/supertripper/app/TripperProtocol;->appendCrc([B)[B

    move-result-object p1

    return-object p1
.end method

.method public final buildNavFromManeuver(Lcom/supertripper/app/TripperProtocol$GoogleManeuver;IBBB)[B
    .locals 11

    const-string v0, "gm"

    move-object v1, p1

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$GoogleManeuver;->getByte5()B

    move-result v4

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$GoogleManeuver;->getByte6()B

    move-result v5

    const/16 v9, 0x10

    const/4 v10, 0x0

    const/4 v6, 0x0

    move-object v1, p0

    move v2, p3

    move v3, p2

    move v7, p4

    move/from16 v8, p5

    invoke-static/range {v1 .. v10}, Lcom/supertripper/app/TripperProtocol;->buildNavPacket$default(Lcom/supertripper/app/TripperProtocol;BIBBBBBILjava/lang/Object;)[B

    move-result-object v0

    return-object v0
.end method

.method public final buildNavPacket(BIBBBBB)[B
    .locals 4

    const/16 v0, 0x14

    new-array v0, v0, [B

    const/16 v1, 0x10

    const/4 v2, 0x0

    aput-byte v1, v0, v2

    const/4 v1, 0x1

    const/16 v3, 0x11

    aput-byte v3, v0, v1

    const/4 v1, 0x2

    aput-byte p1, v0, v1

    shr-int/lit8 p1, p2, 0x8

    and-int/lit16 p1, p1, 0xff

    int-to-byte p1, p1

    const/4 v1, 0x3

    aput-byte p1, v0, v1

    and-int/lit16 p2, p2, 0xff

    int-to-byte p2, p2

    const/4 v3, 0x4

    aput-byte p2, v0, v3

    const/4 v3, 0x5

    aput-byte p3, v0, v3

    const/4 p3, 0x6

    aput-byte p4, v0, p3

    const/4 p3, 0x7

    aput-byte p5, v0, p3

    const/16 p3, 0x8

    aput-byte p1, v0, p3

    const/16 p1, 0x9

    aput-byte p2, v0, p1

    const/16 p1, 0xa

    aput-byte p6, v0, p1

    const/16 p1, 0xb

    aput-byte v2, v0, p1

    const/16 p1, 0xc

    aput-byte p7, v0, p1

    const/16 p1, 0xd

    aput-byte v1, v0, p1

    invoke-direct {p0, v0}, Lcom/supertripper/app/TripperProtocol;->appendCrc([B)[B

    move-result-object p1

    return-object p1
.end method

.method public final buildPinPacket(Ljava/lang/String;)[B
    .locals 4

    const-string v0, "code"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    const/16 v0, 0x14

    new-array v0, v0, [B

    const/4 v1, 0x0

    const/16 v2, 0x20

    aput-byte v2, v0, v1

    sget-object v2, Lkotlin/text/Charsets;->c:Ljava/nio/charset/Charset;

    invoke-virtual {p1, v2}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object p1

    const-string v2, "getBytes(...)"

    invoke-static {p1, v2}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    array-length v2, p1

    const/4 v3, 0x6

    invoke-static {v2, v3}, Ljava/lang/Math;->min(II)I

    move-result v2

    const/4 v3, 0x1

    invoke-static {p1, v3, v0, v1, v2}, LK5/b;->e([BI[BII)V

    invoke-direct {p0, v0}, Lcom/supertripper/app/TripperProtocol;->appendCrc([B)[B

    move-result-object p1

    return-object p1
.end method

.method public final buildSetTimeNowPacket()[B
    .locals 3

    invoke-static {}, Ljava/util/Calendar;->getInstance()Ljava/util/Calendar;

    move-result-object v0

    const/16 v1, 0xb

    invoke-virtual {v0, v1}, Ljava/util/Calendar;->get(I)I

    move-result v1

    const/16 v2, 0xc

    invoke-virtual {v0, v2}, Ljava/util/Calendar;->get(I)I

    move-result v0

    const/4 v2, 0x1

    invoke-virtual {p0, v1, v0, v2}, Lcom/supertripper/app/TripperProtocol;->buildSetTimePacket(IIZ)[B

    move-result-object v0

    return-object v0
.end method

.method public final buildSetTimePacket(IIZ)[B
    .locals 3

    const/16 v0, 0x14

    new-array v0, v0, [B

    const/4 v1, 0x0

    const/16 v2, 0x50

    aput-byte v2, v0, v1

    int-to-byte p1, p1

    const/4 v1, 0x1

    aput-byte p1, v0, v1

    const/4 p1, 0x2

    int-to-byte p2, p2

    aput-byte p2, v0, p1

    xor-int/lit8 p1, p3, 0x1

    const/4 p2, 0x3

    aput-byte p1, v0, p2

    invoke-direct {p0, v0}, Lcom/supertripper/app/TripperProtocol;->appendCrc([B)[B

    move-result-object p1

    return-object p1
.end method

.method public final crc16([B)I
    .locals 8

    const-string v0, "data"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    array-length v0, p1

    const v1, 0xffff

    const/4 v2, 0x0

    move v4, v1

    move v3, v2

    :goto_0
    if-ge v3, v0, :cond_2

    aget-byte v5, p1, v3

    and-int/lit16 v5, v5, 0xff

    const/16 v6, 0x8

    shl-int/2addr v5, v6

    xor-int/2addr v4, v5

    move v5, v2

    :goto_1
    if-ge v5, v6, :cond_1

    const v7, 0x8000

    and-int/2addr v7, v4

    shl-int/lit8 v4, v4, 0x1

    if-eqz v7, :cond_0

    xor-int/lit16 v4, v4, 0x1021

    :cond_0
    and-int/2addr v4, v1

    add-int/lit8 v5, v5, 0x1

    goto :goto_1

    :cond_1
    add-int/lit8 v3, v3, 0x1

    goto :goto_0

    :cond_2
    return v4
.end method

.method public final getCCCD_UUID()Ljava/util/UUID;
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->CCCD_UUID:Ljava/util/UUID;

    return-object v0
.end method

.method public final getPKT_CLOSE()[B
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->PKT_CLOSE:[B

    return-object v0
.end method

.method public final getPKT_NAV_IDLE()[B
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->PKT_NAV_IDLE:[B

    return-object v0
.end method

.method public final getPKT_PING_FW()[B
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->PKT_PING_FW:[B

    return-object v0
.end method

.method public final getPKT_PING_WP()[B
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->PKT_PING_WP:[B

    return-object v0
.end method

.method public final getPKT_PIN_SHOW()[B
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->PKT_PIN_SHOW:[B

    return-object v0
.end method

.method public final getPKT_STOP_NAV()[B
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->PKT_STOP_NAV:[B

    return-object v0
.end method

.method public final getSERVICE_UUID()Ljava/util/UUID;
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->SERVICE_UUID:Ljava/util/UUID;

    return-object v0
.end method

.method public final getWRITE_CHAR_UUID()Ljava/util/UUID;
    .locals 1

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->WRITE_CHAR_UUID:Ljava/util/UUID;

    return-object v0
.end method

.method public final maneuverLabel(B)Ljava/lang/String;
    .locals 1

    if-nez p1, :cond_0

    const-string p1, "Reto"

    goto :goto_0

    :cond_0
    const/16 v0, 0x10

    if-ne p1, v0, :cond_1

    const-string p1, "\u2190 Esquerda"

    goto :goto_0

    :cond_1
    const/16 v0, 0x20

    if-ne p1, v0, :cond_2

    const-string p1, "\u2192 Direita"

    goto :goto_0

    :cond_2
    const/16 v0, 0x30

    if-ne p1, v0, :cond_3

    const-string p1, "\u2192\u2192 Direita Forte"

    goto :goto_0

    :cond_3
    const/16 v0, 0x40

    if-ne p1, v0, :cond_4

    const-string p1, "\u2191 Manter"

    goto :goto_0

    :cond_4
    const/16 v0, 0x50

    if-ne p1, v0, :cond_5

    const-string p1, "\u21a9 Retorno"

    goto :goto_0

    :cond_5
    const/16 v0, 0x60

    if-ne p1, v0, :cond_6

    const-string p1, "\u2934 Rodovia"

    goto :goto_0

    :cond_6
    invoke-static {p1}, Ljava/lang/Byte;->valueOf(B)Ljava/lang/Byte;

    move-result-object p1

    filled-new-array {p1}, [Ljava/lang/Object;

    move-result-object p1

    const/4 v0, 0x1

    invoke-static {p1, v0}, Ljava/util/Arrays;->copyOf([Ljava/lang/Object;I)[Ljava/lang/Object;

    move-result-object p1

    const-string v0, "0x%02X"

    invoke-static {v0, p1}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p1

    :goto_0
    return-object p1
.end method

.method public final parseResponse([B)Lcom/supertripper/app/TripperProtocol$TripperResponse;
    .locals 8

    const-string v0, "bytes"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    array-length v0, p1

    const/4 v1, 0x0

    if-nez v0, :cond_0

    new-instance v0, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    const-string v2, "EMPTY"

    const-string v3, "vazio"

    invoke-direct {v0, v1, v2, v3, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    return-object v0

    :cond_0
    aget-byte v0, p1, v1

    and-int/lit16 v0, v0, 0xff

    const/4 v2, 0x2

    if-eq v0, v2, :cond_d

    const/4 v3, 0x3

    const/4 v4, 0x1

    if-eq v0, v3, :cond_b

    const/16 v2, 0x10

    if-eq v0, v2, :cond_a

    const/16 v2, 0x30

    const/16 v3, 0x20

    if-eq v0, v2, :cond_6

    const/16 v2, 0x50

    if-eq v0, v2, :cond_5

    if-eq v0, v3, :cond_2

    const/16 v1, 0x21

    if-eq v0, v1, :cond_1

    new-instance v1, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    invoke-static {v0}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v2

    filled-new-array {v2}, [Ljava/lang/Object;

    move-result-object v2

    invoke-static {v2, v4}, Ljava/util/Arrays;->copyOf([Ljava/lang/Object;I)[Ljava/lang/Object;

    move-result-object v2

    const-string v3, "0x%02X"

    invoke-static {v3, v2}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v2

    const-string v3, "comando n\u00e3o tratado"

    invoke-direct {v1, v0, v2, v3, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    goto/16 :goto_3

    :cond_1
    new-instance v1, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    const-string v2, "SESSION"

    const-string v3, "Sess\u00e3o"

    invoke-direct {v1, v0, v2, v3, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    goto/16 :goto_3

    :cond_2
    array-length v2, p1

    if-le v2, v4, :cond_3

    aget-byte v2, p1, v4

    if-ne v2, v4, :cond_3

    move v1, v4

    :cond_3
    new-instance v2, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    if-eqz v1, :cond_4

    const-string v1, "\u2713 PIN ACEITO"

    goto :goto_0

    :cond_4
    const-string v1, "\u2717 PIN REJEITADO"

    :goto_0
    const-string v3, "AUTH"

    invoke-direct {v2, v0, v3, v1, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    :goto_1
    move-object v1, v2

    goto/16 :goto_3

    :cond_5
    new-instance v1, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    const-string v2, "TIME_ACK"

    const-string v3, "Time ACK"

    invoke-direct {v1, v0, v2, v3, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    goto/16 :goto_3

    :cond_6
    array-length v1, p1

    const-string v2, "SERIAL"

    const/16 v5, 0x8

    if-lt v1, v5, :cond_9

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    :goto_2
    if-ge v4, v5, :cond_8

    aget-byte v6, p1, v4

    and-int/lit16 v6, v6, 0xff

    if-eqz v6, :cond_8

    if-gt v3, v6, :cond_7

    const/16 v7, 0x7f

    if-ge v6, v7, :cond_7

    int-to-char v6, v6

    invoke-virtual {v1, v6}, Ljava/lang/StringBuilder;->append(C)Ljava/lang/StringBuilder;

    :cond_7
    add-int/lit8 v4, v4, 0x1

    goto :goto_2

    :cond_8
    new-instance v3, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    new-instance v4, Ljava/lang/StringBuilder;

    const-string v5, "Serial: \""

    invoke-direct {v4, v5}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v4, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    const/16 v1, 0x22

    invoke-virtual {v4, v1}, Ljava/lang/StringBuilder;->append(C)Ljava/lang/StringBuilder;

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-direct {v3, v0, v2, v1, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    move-object v1, v3

    goto :goto_3

    :cond_9
    new-instance v1, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    const-string v3, "Serial curto"

    invoke-direct {v1, v0, v2, v3, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    goto :goto_3

    :cond_a
    new-instance v1, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    const-string v2, "NAV_ACK"

    const-string v3, "NAV ACK"

    invoke-direct {v1, v0, v2, v3, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    goto :goto_3

    :cond_b
    array-length v1, p1

    const-string v5, "OS_VERSION"

    if-lt v1, v3, :cond_c

    aget-byte v1, p1, v4

    and-int/lit16 v3, v1, 0xff

    aget-byte v2, p1, v2

    and-int/lit16 v4, v2, 0xff

    shr-int/lit8 v6, v3, 0x4

    mul-int/lit8 v6, v6, 0xa

    and-int/lit8 v1, v1, 0xf

    add-int/2addr v6, v1

    shr-int/lit8 v1, v4, 0x4

    mul-int/lit8 v1, v1, 0xa

    and-int/lit8 v2, v2, 0xf

    add-int/2addr v1, v2

    new-instance v2, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    invoke-static {v3}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v3

    invoke-static {v4}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v4

    invoke-static {v6}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v6

    invoke-static {v1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v1

    filled-new-array {v3, v4, v6, v1}, [Ljava/lang/Object;

    move-result-object v1

    const/4 v3, 0x4

    invoke-static {v1, v3}, Ljava/util/Arrays;->copyOf([Ljava/lang/Object;I)[Ljava/lang/Object;

    move-result-object v1

    const-string v3, "Firmware: v0x%02X.0x%02X (%d.%d)"

    invoke-static {v3, v1}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v1

    invoke-direct {v2, v0, v5, v1, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    goto/16 :goto_1

    :cond_c
    new-instance v1, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    const-string v2, "OS version curto"

    invoke-direct {v1, v0, v5, v2, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    goto :goto_3

    :cond_d
    new-instance v1, Lcom/supertripper/app/TripperProtocol$TripperResponse;

    const-string v2, "NACK"

    const-string v3, "NAK \u2014 comando rejeitado"

    invoke-direct {v1, v0, v2, v3, p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;-><init>(ILjava/lang/String;Ljava/lang/String;[B)V

    :goto_3
    return-object v1
.end method

.method public final roadLabel(B)Ljava/lang/String;
    .locals 1

    const/16 v0, 0x41

    if-ne p1, v0, :cond_0

    const-string p1, "Rua"

    goto :goto_0

    :cond_0
    const/16 v0, 0x42

    if-ne p1, v0, :cond_1

    const-string p1, "Avenida"

    goto :goto_0

    :cond_1
    const/16 v0, 0x31

    if-ne p1, v0, :cond_2

    const-string p1, "Rodovia"

    goto :goto_0

    :cond_2
    invoke-static {p1}, Ljava/lang/Byte;->valueOf(B)Ljava/lang/Byte;

    move-result-object p1

    filled-new-array {p1}, [Ljava/lang/Object;

    move-result-object p1

    const/4 v0, 0x1

    invoke-static {p1, v0}, Ljava/util/Arrays;->copyOf([Ljava/lang/Object;I)[Ljava/lang/Object;

    move-result-object p1

    const-string v0, "0x%02X"

    invoke-static {v0, p1}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p1

    :goto_0
    return-object p1
.end method

.method public final screenLabel(B)Ljava/lang/String;
    .locals 1

    const/16 v0, 0x3c

    if-ne p1, v0, :cond_0

    const-string p1, "IDLE"

    goto :goto_0

    :cond_0
    const/16 v0, 0x14

    if-ne p1, v0, :cond_1

    const-string p1, "TBT"

    goto :goto_0

    :cond_1
    const/16 v0, 0x15

    if-ne p1, v0, :cond_2

    const-string p1, "CHEGANDO"

    goto :goto_0

    :cond_2
    const/16 v0, 0x32

    if-ne p1, v0, :cond_3

    const-string p1, "RODOVIA"

    goto :goto_0

    :cond_3
    const/16 v0, 0x1c

    if-ne p1, v0, :cond_4

    const-string p1, "PARAR"

    goto :goto_0

    :cond_4
    const/16 v0, 0x3d

    if-ne p1, v0, :cond_5

    const-string p1, "RECALC"

    goto :goto_0

    :cond_5
    const/4 v0, 0x1

    if-ne p1, v0, :cond_6

    const-string p1, "LAST"

    goto :goto_0

    :cond_6
    invoke-static {p1}, Ljava/lang/Byte;->valueOf(B)Ljava/lang/Byte;

    move-result-object p1

    filled-new-array {p1}, [Ljava/lang/Object;

    move-result-object p1

    invoke-static {p1, v0}, Ljava/util/Arrays;->copyOf([Ljava/lang/Object;I)[Ljava/lang/Object;

    move-result-object p1

    const-string v0, "0x%02X"

    invoke-static {v0, p1}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p1

    :goto_0
    return-object p1
.end method

.method public final toHex([B)Ljava/lang/String;
    .locals 2

    const-string v0, "bytes"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    sget-object v0, Lcom/supertripper/app/TripperProtocol$toHex$1;->INSTANCE:Lcom/supertripper/app/TripperProtocol$toHex$1;

    const-string v1, " "

    invoke-static {p1, v1, v0}, Lkotlin/collections/c;->b0([BLjava/lang/String;Lkotlin/jvm/functions/Function1;)Ljava/lang/String;

    move-result-object p1

    return-object p1
.end method
