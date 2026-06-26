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

