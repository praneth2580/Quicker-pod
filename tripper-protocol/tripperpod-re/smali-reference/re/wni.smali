.class public Lbluconnect/wni;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation


# static fields
.field public static p:I

.field public static q:Ljava/util/ArrayList;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/ArrayList<",
            "Lbluconnect/f22;",
            ">;"
        }
    .end annotation
.end field

.field public static r:Ljava/util/Queue;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Queue<",
            "[B>;"
        }
    .end annotation
.end field

.field public static s:[B

.field public static t:Z

.field public static u:Z

.field public static v:Ljava/util/Timer;

.field public static w:Lbluconnect/btb;

.field public static x:J

.field public static y:J

.field public static final z:Ljava/lang/String;


# instance fields
.field public a:Z

.field public b:I

.field public c:Lbluconnect/j22;

.field public d:J

.field public e:[B

.field public f:Lbluconnect/toh;

.field public g:I

.field public h:I

.field public final i:J

.field public j:Ljava/lang/String;

.field public k:Ljava/lang/String;

.field public l:Ljava/lang/String;

.field public m:Ljava/lang/String;

.field public n:Z

.field public o:Lbluconnect/kdk;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    new-instance v0, Ljava/util/LinkedList;

    invoke-direct {v0}, Ljava/util/LinkedList;-><init>()V

    sput-object v0, Lbluconnect/wni;->r:Ljava/util/Queue;

    const/4 v0, 0x0

    sput-object v0, Lbluconnect/wni;->v:Ljava/util/Timer;

    const-class v0, Lbluconnect/wni;

    invoke-virtual {v0}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v0

    sput-object v0, Lbluconnect/wni;->z:Ljava/lang/String;

    return-void
.end method

.method public constructor <init>()V
    .locals 3

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 v0, 0x0

    iput-boolean v0, p0, Lbluconnect/wni;->a:Z

    new-instance v1, Lbluconnect/j22;

    invoke-direct {v1}, Lbluconnect/j22;-><init>()V

    iput-object v1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    new-instance v1, Lbluconnect/toh;

    invoke-direct {v1}, Lbluconnect/toh;-><init>()V

    iput-object v1, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    iput v0, p0, Lbluconnect/wni;->g:I

    iput v0, p0, Lbluconnect/wni;->h:I

    const-wide/16 v1, 0x1388

    iput-wide v1, p0, Lbluconnect/wni;->i:J

    const-string v1, "/Android/data/com.bosch.ble/files/"

    iput-object v1, p0, Lbluconnect/wni;->l:Ljava/lang/String;

    const-string v1, "/Android/data/com.royalenfield.reprime/files/"

    iput-object v1, p0, Lbluconnect/wni;->m:Ljava/lang/String;

    iput-boolean v0, p0, Lbluconnect/wni;->n:Z

    new-instance v0, Lbluconnect/kdk;

    invoke-direct {v0}, Lbluconnect/kdk;-><init>()V

    iput-object v0, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    return-void
.end method

.method public static h(Z[B)V
    .locals 1

    sput-boolean p0, Lbluconnect/wni;->t:Z

    sget-object v0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz v0, :cond_2

    sget-object v0, Lbluconnect/dma;->y:Landroid/bluetooth/BluetoothGatt;

    if-nez v0, :cond_0

    goto :goto_0

    :cond_0
    if-eqz p0, :cond_1

    sget-object p0, Lbluconnect/wni;->r:Ljava/util/Queue;

    invoke-interface {p0, p1}, Ljava/util/Queue;->offer(Ljava/lang/Object;)Z

    return-void

    :cond_1
    sget-object p0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    const/4 v0, 0x1

    invoke-virtual {p0, v0}, Landroid/bluetooth/BluetoothGattCharacteristic;->setWriteType(I)V

    sget-object p0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {p0, p1}, Landroid/bluetooth/BluetoothGattCharacteristic;->setValue([B)Z

    sget-object p0, Lbluconnect/dma;->y:Landroid/bluetooth/BluetoothGatt;

    sget-object p1, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {p0, p1}, Landroid/bluetooth/BluetoothGatt;->writeCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    :cond_2
    :goto_0
    return-void
.end method


# virtual methods
.method public a([BLbluconnect/btb;Lbluconnect/ysb;)V
    .locals 11

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v0

    sput-wide v0, Lbluconnect/wni;->y:J

    iget-object v0, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "Received Response : "

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget-object v2, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    const-string v3, ""

    invoke-virtual {v2, p1, v3}, Lbluconnect/toh;->b([BLjava/lang/String;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    iget-boolean v2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {v0, v1, v2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    const/4 v0, 0x1

    sput-boolean v0, Lbluconnect/wni;->u:Z

    invoke-virtual {p0, p1}, Lbluconnect/wni;->g([B)Z

    move-result v1

    if-nez v1, :cond_0

    sget-object p0, Lbluconnect/fs8;->I2:Lbluconnect/fs8;

    iget p0, p0, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p0}, Lbluconnect/btb;->c(I)V

    return-void

    :cond_0
    const/4 v1, 0x0

    aget-byte v2, p1, v1

    const/4 v3, 0x2

    if-ne v2, v3, :cond_2

    aget-byte p1, p1, v0

    if-ne p1, v0, :cond_1

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p3

    const-string v0, "processReplyFromDisplay: SUCCESS 0X02"

    new-array v1, v1, [Ljava/lang/Object;

    invoke-virtual {p3, v0, v1}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    sget-object p3, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {p3, p1}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    sget p1, Lbluconnect/wni;->p:I

    invoke-static {p1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object p1

    filled-new-array {p1}, [Ljava/lang/Object;

    move-result-object p1

    const-string v0, "processReplyFromDisplay: %s"

    invoke-virtual {p3, v0, p1}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    invoke-interface {p2}, Lbluconnect/btb;->a()V

    iget-object p0, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p0}, Lbluconnect/j22;->l()V

    return-void

    :cond_1
    if-ne p1, v3, :cond_17

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p3, v1, [Ljava/lang/Object;

    const-string v0, "onCharacteristicWrite:0x02 NEGATIVE ACK"

    invoke-virtual {p1, v0, p3}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, v0, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    sget-object p0, Lbluconnect/fs8;->w2:Lbluconnect/fs8;

    iget p0, p0, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p0}, Lbluconnect/btb;->c(I)V

    return-void

    :cond_2
    const/4 v4, 0x3

    if-ne v2, v4, :cond_4

    sget-object p2, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p2}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object v2

    aget-byte v4, p1, v1

    invoke-static {v4}, Ljava/lang/Byte;->valueOf(B)Ljava/lang/Byte;

    move-result-object v4

    filled-new-array {v4}, [Ljava/lang/Object;

    move-result-object v4

    const-string v5, "processReplyFromDisplay: SUCCESS 0X03: %s"

    invoke-virtual {v2, v5, v4}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    sget-object v2, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {v2, p2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    new-instance v4, Ljava/lang/StringBuilder;

    const-string v5, "processReplyFromDisplay: s/w version received:0x03: "

    invoke-direct {v4, v5}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    aget-byte v6, p1, v0

    invoke-virtual {v4, v6}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v6, "."

    invoke-virtual {v4, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    aget-byte v7, p1, v3

    invoke-virtual {v4, v7}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v4

    new-array v7, v1, [Ljava/lang/Object;

    invoke-virtual {v2, v4, v7}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object v4, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    new-instance v7, Ljava/lang/StringBuilder;

    invoke-direct {v7, v5}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    aget-byte v5, p1, v0

    invoke-virtual {v7, v5}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v7, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    aget-byte v5, p1, v3

    invoke-virtual {v7, v5}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v7}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v5

    iget-boolean v7, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {v4, v5, v7}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    iget-object v4, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    aget-byte v0, p1, v0

    invoke-virtual {v4, v0}, Lbluconnect/toh;->a(B)Ljava/lang/String;

    move-result-object v0

    iget-object v4, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    aget-byte p1, p1, v3

    invoke-virtual {v4, p1}, Lbluconnect/toh;->a(B)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {v2, p2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "processReplyFromDisplay: s/w version decoded:0x03: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    new-array v4, v1, [Ljava/lang/Object;

    invoke-virtual {v2, v3, v4}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v3, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    sput-object p1, Lbluconnect/dma;->w:Ljava/lang/String;

    sget-boolean v0, Lbluconnect/dma;->s:Z

    if-eqz v0, :cond_3

    invoke-static {}, Lbluconnect/dma;->n()Lbluconnect/dma;

    move-result-object p3

    invoke-virtual {p3}, Lbluconnect/dma;->d()V

    sput-boolean v1, Lbluconnect/dma;->s:Z

    goto :goto_0

    :cond_3
    invoke-interface {p3, p1}, Lbluconnect/ysb;->a(Ljava/lang/String;)V

    :goto_0
    invoke-virtual {v2, p2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    new-instance p3, Ljava/lang/StringBuilder;

    const-string v0, "processReplyFromDisplay: tripperDeviceVersion="

    invoke-direct {p3, v0}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p3, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p3

    filled-new-array {p3}, [Ljava/lang/Object;

    move-result-object p3

    invoke-virtual {v2, p2, p3}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p2, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    const-string p3, "processReplyFromDisplay: Storing deviceVersion:"

    invoke-static {p3, p1}, Lbluconnect/f1q;->a(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p2, p1, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    return-void

    :cond_4
    const/4 p3, 0x4

    const/4 v5, 0x5

    if-ne v2, p3, :cond_6

    sget-object v2, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {v2}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object v6

    new-array v7, v1, [Ljava/lang/Object;

    const-string v8, "processReplyFromDisplay: SUCCESS 0X04"

    invoke-virtual {v6, v8, v7}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object v6, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean v7, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {v6, v8, v7}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    aget-byte v5, p1, v5

    if-ne v5, v3, :cond_5

    sget-object p1, Lbluconnect/fs8;->x2:Lbluconnect/fs8;

    iget p1, p1, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p1}, Lbluconnect/btb;->c(I)V

    sget-object p1, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {p1, v2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "Abort Checksum error! 0x02"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    return-void

    :cond_5
    iget-object p2, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    const-string v5, "initialize flash"

    iget-boolean v6, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p2, v5, v6}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    aget-byte p2, p1, v4

    new-array v5, p3, [B

    aput-byte v1, v5, v1

    aput-byte v1, v5, v0

    aput-byte v1, v5, v3

    aput-byte p2, v5, v4

    invoke-static {v5}, Ljava/nio/ByteBuffer;->wrap([B)Ljava/nio/ByteBuffer;

    move-result-object p2

    invoke-virtual {p2}, Ljava/nio/ByteBuffer;->getInt()I

    move-result p2

    sput p2, Lbluconnect/j22;->h:I

    aget-byte p2, p1, v0

    aget-byte p1, p1, v3

    new-array p3, p3, [B

    aput-byte v1, p3, v1

    aput-byte v1, p3, v0

    aput-byte p2, p3, v3

    aput-byte p1, p3, v4

    invoke-static {p3}, Ljava/nio/ByteBuffer;->wrap([B)Ljava/nio/ByteBuffer;

    move-result-object p1

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->getInt()I

    move-result p1

    sput p1, Lbluconnect/j22;->g:I

    sget-object p1, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {p1, v2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    sget p2, Lbluconnect/j22;->g:I

    invoke-static {p2}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object p2

    filled-new-array {p2}, [Ljava/lang/Object;

    move-result-object p2

    const-string p3, "processReply:0x04 %s"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    invoke-virtual {p1, v2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    sget p2, Lbluconnect/j22;->h:I

    invoke-static {p2}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object p2

    filled-new-array {p2}, [Ljava/lang/Object;

    move-result-object p2

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    invoke-virtual {p0}, Lbluconnect/wni;->c()V

    invoke-virtual {p0}, Lbluconnect/wni;->b()V

    sput-boolean v0, Lbluconnect/wni;->t:Z

    return-void

    :cond_6
    if-ne v2, v5, :cond_8

    aget-byte p1, p1, v5

    if-ne p1, v0, :cond_7

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: SUCCESS 0X05"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    iget-object p0, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    sget-object p1, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    invoke-virtual {p1, v1}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object p1

    check-cast p1, Lbluconnect/f22;

    invoke-virtual {p0, p1, v1}, Lbluconnect/j22;->n(Lbluconnect/f22;I)V

    return-void

    :cond_7
    if-ne p1, v3, :cond_17

    sget-object p1, Lbluconnect/fs8;->y2:Lbluconnect/fs8;

    iget p1, p1, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p1}, Lbluconnect/btb;->c(I)V

    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p1, v3}, Lbluconnect/j22;->r(B)V

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    const-string p2, "processReplyFromDisplay: Abort Checksum error! 0x02"

    new-array p3, v1, [Ljava/lang/Object;

    invoke-virtual {p1, p2, p3}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    const-string p2, "processReplyFromDisplay:0x05 Abort Checksum error! 0x02"

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p2, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    return-void

    :cond_8
    const/4 v6, 0x6

    if-ne v2, v6, :cond_a

    aget-byte p1, p1, v0

    if-ne p1, v0, :cond_9

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: SUCCESS 0X06"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide p1

    iput-wide p1, p0, Lbluconnect/wni;->d:J

    invoke-virtual {p0}, Lbluconnect/wni;->f()V

    return-void

    :cond_9
    sget-object p1, Lbluconnect/fs8;->z2:Lbluconnect/fs8;

    iget p1, p1, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p1}, Lbluconnect/btb;->c(I)V

    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p1, v3}, Lbluconnect/j22;->r(B)V

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: Abort Checksum error! 0x06"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    return-void

    :cond_a
    const/4 v6, 0x7

    if-ne v2, v6, :cond_d

    aget-byte p1, p1, v5

    if-ne p1, v0, :cond_b

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: SUCCESS 0X07"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    iput v1, p0, Lbluconnect/wni;->g:I

    invoke-virtual {p0}, Lbluconnect/wni;->f()V

    return-void

    :cond_b
    iget p1, p0, Lbluconnect/wni;->g:I

    sget p3, Lbluconnect/ljm;->c:I

    if-ge p1, p3, :cond_c

    invoke-virtual {p0}, Lbluconnect/wni;->d()V

    iget p1, p0, Lbluconnect/wni;->g:I

    add-int/2addr p1, v0

    iput p1, p0, Lbluconnect/wni;->g:I

    return-void

    :cond_c
    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p1, v3}, Lbluconnect/j22;->r(B)V

    sget-object p1, Lbluconnect/fs8;->A2:Lbluconnect/fs8;

    iget p1, p1, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p1}, Lbluconnect/btb;->c(I)V

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: Segment retry exceeded! 0x07"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    iput v1, p0, Lbluconnect/wni;->g:I

    return-void

    :cond_d
    const/16 v5, 0x8

    if-ne v2, v5, :cond_11

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v5

    sget-object v2, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {v2}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object v7

    iget-wide v8, p0, Lbluconnect/wni;->d:J

    sub-long v8, v5, v8

    invoke-static {v8, v9}, Ljava/lang/Long;->valueOf(J)Ljava/lang/Long;

    move-result-object v8

    filled-new-array {v8}, [Ljava/lang/Object;

    move-result-object v8

    const-string v9, "processReplyFromDisplay: block time in ms %s"

    invoke-virtual {v7, v9, v8}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object v7, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    new-instance v8, Ljava/lang/StringBuilder;

    const-string v9, "processReplyFromDisplay: block time in ms "

    invoke-direct {v8, v9}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget-wide v9, p0, Lbluconnect/wni;->d:J

    sub-long/2addr v5, v9

    invoke-virtual {v8, v5, v6}, Ljava/lang/StringBuilder;->append(J)Ljava/lang/StringBuilder;

    invoke-virtual {v8}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v5

    iget-boolean v6, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {v7, v5, v6}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    sget-object v5, Lbluconnect/wni;->r:Ljava/util/Queue;

    invoke-interface {v5}, Ljava/util/Collection;->clear()V

    aget-byte v5, p1, v4

    if-ne v5, v0, :cond_f

    sget-object v5, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {v5, v2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    new-array v2, v1, [Ljava/lang/Object;

    const-string v6, "processReplyFromDisplay: SUCCESS 0X08"

    invoke-virtual {v5, v6, v2}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object v2, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean v5, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {v2, v6, v5}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    aget-byte v2, p1, v0

    aget-byte p1, p1, v3

    new-array p3, p3, [B

    aput-byte v1, p3, v1

    aput-byte v1, p3, v0

    aput-byte v2, p3, v3

    aput-byte p1, p3, v4

    invoke-static {p3}, Ljava/nio/ByteBuffer;->wrap([B)Ljava/nio/ByteBuffer;

    move-result-object p1

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->getInt()I

    move-result p1

    iput p1, p0, Lbluconnect/wni;->b:I

    int-to-float p1, p1

    sget p3, Lbluconnect/wni;->p:I

    int-to-float p3, p3

    div-float/2addr p1, p3

    float-to-double v2, p1

    const-wide/high16 v4, 0x4059000000000000L    # 100.0

    mul-double/2addr v2, v4

    invoke-interface {p2, v2, v3}, Lbluconnect/btb;->d(D)V

    iput v1, p0, Lbluconnect/wni;->h:I

    iget p1, p0, Lbluconnect/wni;->b:I

    add-int/2addr p1, v0

    iput p1, p0, Lbluconnect/wni;->b:I

    sget-object p2, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    invoke-virtual {p2}, Ljava/util/ArrayList;->size()I

    move-result p2

    if-ge p1, p2, :cond_e

    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    sget-object p2, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    iget p3, p0, Lbluconnect/wni;->b:I

    invoke-virtual {p2, p3}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object p2

    check-cast p2, Lbluconnect/f22;

    iget p0, p0, Lbluconnect/wni;->b:I

    invoke-virtual {p1, p2, p0}, Lbluconnect/j22;->n(Lbluconnect/f22;I)V

    return-void

    :cond_e
    iget p1, p0, Lbluconnect/wni;->b:I

    sget-object p2, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    invoke-virtual {p2}, Ljava/util/ArrayList;->size()I

    move-result p2

    if-ne p1, p2, :cond_17

    iget-object p0, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p0}, Lbluconnect/j22;->q()V

    return-void

    :cond_f
    iget p1, p0, Lbluconnect/wni;->h:I

    invoke-static {}, Lbluconnect/f22;->e()I

    move-result p3

    if-ge p1, p3, :cond_10

    iget p1, p0, Lbluconnect/wni;->h:I

    add-int/2addr p1, v0

    iput p1, p0, Lbluconnect/wni;->h:I

    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    sget-object p2, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    iget p3, p0, Lbluconnect/wni;->b:I

    invoke-virtual {p2, p3}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object p2

    check-cast p2, Lbluconnect/f22;

    iget p0, p0, Lbluconnect/wni;->b:I

    invoke-virtual {p1, p2, p0}, Lbluconnect/j22;->n(Lbluconnect/f22;I)V

    return-void

    :cond_10
    sget-object p1, Lbluconnect/fs8;->B2:Lbluconnect/fs8;

    iget p1, p1, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p1}, Lbluconnect/btb;->c(I)V

    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p1, v3}, Lbluconnect/j22;->r(B)V

    sget-object p1, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {p1, v2}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: Block retry exceeded! 0x08"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    return-void

    :cond_11
    const/16 p3, 0x9

    if-ne v2, p3, :cond_14

    aget-byte p1, p1, v0

    if-ne p1, v0, :cond_12

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: SUCCESS 0X09"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    iget-object p0, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p0, v0}, Lbluconnect/j22;->r(B)V

    return-void

    :cond_12
    if-ne p1, v3, :cond_13

    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p1, v3}, Lbluconnect/j22;->r(B)V

    sget-object p1, Lbluconnect/fs8;->D2:Lbluconnect/fs8;

    iget p1, p1, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p1}, Lbluconnect/btb;->c(I)V

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: Abort Checksum error! 0x09 0x02"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    return-void

    :cond_13
    if-ne p1, v4, :cond_17

    iget-object p1, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-virtual {p1, v3}, Lbluconnect/j22;->r(B)V

    sget-object p1, Lbluconnect/fs8;->E2:Lbluconnect/fs8;

    iget p1, p1, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p1}, Lbluconnect/btb;->c(I)V

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p2, v1, [Ljava/lang/Object;

    const-string p3, "processReplyFromDisplay: Abort File error! 0x09 0x03"

    invoke-virtual {p1, p3, p2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    return-void

    :cond_14
    const/16 p3, 0xa

    if-ne v2, p3, :cond_17

    aget-byte p1, p1, v0

    if-ne p1, v0, :cond_15

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p3

    const-string v0, "processReplyFromDisplay: SUCCESS 0X0A"

    new-array v2, v1, [Ljava/lang/Object;

    invoke-virtual {p3, v0, v2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    sget-object p3, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {p3, p1}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    const-string p1, "run: Flashing complete!"

    new-array v0, v1, [Ljava/lang/Object;

    invoke-virtual {p3, p1, v0}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    const-string p3, "Flashing complete!"

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, p3, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    invoke-interface {p2}, Lbluconnect/btb;->b()V

    const/4 p0, 0x0

    sput-object p0, Lbluconnect/dma;->w:Ljava/lang/String;

    return-void

    :cond_15
    if-ne p1, v3, :cond_16

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p3, v1, [Ljava/lang/Object;

    const-string v0, "processReplyFromDisplay: Checksum error! 0x0A 0x02"

    invoke-virtual {p1, v0, p3}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, v0, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    sget-object p0, Lbluconnect/fs8;->F2:Lbluconnect/fs8;

    iget p0, p0, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p0}, Lbluconnect/btb;->c(I)V

    return-void

    :cond_16
    if-ne p1, v4, :cond_17

    sget-object p1, Lbluconnect/wni;->z:Ljava/lang/String;

    invoke-static {p1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object p1

    new-array p3, v1, [Ljava/lang/Object;

    const-string v0, "processReplyFromDisplay: Re-flash update error! 0x0A 0x03"

    invoke-virtual {p1, v0, p3}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object p1, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    iget-boolean p0, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {p1, v0, p0}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    sget-object p0, Lbluconnect/fs8;->G2:Lbluconnect/fs8;

    iget p0, p0, Lbluconnect/fs8;->v2:I

    invoke-interface {p2, p0}, Lbluconnect/btb;->c(I)V

    :cond_17
    return-void
.end method

.method public final b()V
    .locals 6

    invoke-static {}, Landroid/os/Environment;->getExternalStorageDirectory()Ljava/io/File;

    const/4 v0, 0x0

    sput v0, Lbluconnect/wni;->p:I

    new-instance v1, Ljava/io/File;

    invoke-static {}, Lbluconnect/dma;->n()Lbluconnect/dma;

    move-result-object v2

    iget-object v2, v2, Lbluconnect/dma;->p:Ljava/lang/String;

    invoke-direct {v1, v2}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    sget-object v2, Lbluconnect/dma;->v:Ljava/lang/String;

    const-string v3, "full"

    invoke-virtual {v2, v3}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z

    move-result v2

    if-nez v2, :cond_0

    sget-object v2, Lbluconnect/wni;->z:Ljava/lang/String;

    const-string v3, "readSrecFileContent: inside myupdateeeee"

    invoke-static {v2, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v2, Ljava/io/File;

    invoke-static {}, Lbluconnect/dma;->n()Lbluconnect/dma;

    move-result-object v3

    iget-object v3, v3, Lbluconnect/dma;->q:Ljava/lang/String;

    invoke-direct {v2, v3}, Ljava/io/File;-><init>(Ljava/lang/String;)V

    const/4 v3, 0x1

    iput-boolean v3, p0, Lbluconnect/wni;->n:Z

    goto :goto_0

    :cond_0
    const/4 v2, 0x0

    :goto_0
    iget-object v3, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    invoke-static {}, Lbluconnect/dma;->n()Lbluconnect/dma;

    move-result-object v4

    invoke-virtual {v4}, Lbluconnect/dma;->m()Landroid/content/Context;

    move-result-object v4

    iget-boolean v5, p0, Lbluconnect/wni;->n:Z

    invoke-virtual {v3, v4, v1, v2, v5}, Lbluconnect/j22;->c(Landroid/content/Context;Ljava/io/File;Ljava/io/File;Z)Ljava/util/ArrayList;

    move-result-object v1

    sput-object v1, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    sget-object v1, Lbluconnect/j22;->f:Ljava/lang/String;

    invoke-static {v1}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object v1

    sget-object v2, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    invoke-virtual {v2}, Ljava/util/ArrayList;->size()I

    move-result v2

    invoke-static {v2}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v2

    filled-new-array {v2}, [Ljava/lang/Object;

    move-result-object v2

    const-string v3, "readSrecFileContent: end%s"

    invoke-virtual {v1, v3, v2}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    sget-object v1, Ljava/lang/System;->out:Ljava/io/PrintStream;

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "blocks.size():: "

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    sget-object v3, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    invoke-virtual {v3}, Ljava/util/ArrayList;->size()I

    move-result v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/io/PrintStream;->println(Ljava/lang/String;)V

    sget-object v1, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    invoke-virtual {v1}, Ljava/util/ArrayList;->size()I

    move-result v1

    sput v1, Lbluconnect/wni;->p:I

    sget-object v1, Lbluconnect/j22;->f:Ljava/lang/String;

    sget-object v2, Lbluconnect/fjp;->a:Lbluconnect/fjp$b;

    invoke-virtual {v2, v1}, Lbluconnect/fjp$b;->H(Ljava/lang/String;)Lbluconnect/fjp$c;

    sget v1, Lbluconnect/wni;->p:I

    invoke-static {v1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v1

    filled-new-array {v1}, [Ljava/lang/Object;

    move-result-object v1

    const-string v3, "readSrecFileContent:totalBlocks %s"

    invoke-virtual {v2, v3, v1}, Lbluconnect/fjp$b;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    sget-object v1, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    if-eqz v1, :cond_1

    invoke-virtual {v1}, Ljava/util/ArrayList;->size()I

    move-result v1

    if-lez v1, :cond_1

    iget-object p0, p0, Lbluconnect/wni;->c:Lbluconnect/j22;

    sget-object v1, Lbluconnect/wni;->q:Ljava/util/ArrayList;

    invoke-virtual {v1, v0}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lbluconnect/f22;

    invoke-virtual {v0}, Lbluconnect/f22;->h()[B

    move-result-object v0

    sget v1, Lbluconnect/wni;->p:I

    invoke-virtual {p0, v0, v1}, Lbluconnect/j22;->k([BI)V

    :cond_1
    return-void
.end method

.method public final c()V
    .locals 1

    sget-object p0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz p0, :cond_0

    const/4 v0, 0x1

    invoke-virtual {p0, v0}, Landroid/bluetooth/BluetoothGattCharacteristic;->setWriteType(I)V

    sget-object p0, Lbluconnect/dma;->y:Landroid/bluetooth/BluetoothGatt;

    const/16 v0, 0xf7

    invoke-virtual {p0, v0}, Landroid/bluetooth/BluetoothGatt;->requestMtu(I)Z

    :cond_0
    return-void
.end method

.method public final d()V
    .locals 5

    iget-object v0, p0, Lbluconnect/wni;->e:[B

    if-eqz v0, :cond_0

    sget-object v0, Lbluconnect/j22;->f:Ljava/lang/String;

    invoke-static {v0}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object v0

    iget-object v1, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    iget-object v2, p0, Lbluconnect/wni;->e:[B

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lbluconnect/toh;->b([BLjava/lang/String;)Ljava/lang/String;

    move-result-object v1

    filled-new-array {v1}, [Ljava/lang/Object;

    move-result-object v1

    const-string v2, "sending.. retry%s"

    invoke-virtual {v0, v2, v1}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object v0, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "sending.. retry"

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget-object v2, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    iget-object v4, p0, Lbluconnect/wni;->e:[B

    invoke-virtual {v2, v4, v3}, Lbluconnect/toh;->b([BLjava/lang/String;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    iget-boolean v2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {v0, v1, v2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    sget-object v0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Landroid/bluetooth/BluetoothGattCharacteristic;->setWriteType(I)V

    sget-object v0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    iget-object p0, p0, Lbluconnect/wni;->e:[B

    invoke-virtual {v0, p0}, Landroid/bluetooth/BluetoothGattCharacteristic;->setValue([B)Z

    sget-object p0, Lbluconnect/dma;->y:Landroid/bluetooth/BluetoothGatt;

    sget-object v0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {p0, v0}, Landroid/bluetooth/BluetoothGatt;->writeCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    :cond_0
    return-void
.end method

.method public e()V
    .locals 0

    new-instance p0, Lbluconnect/j22;

    invoke-direct {p0}, Lbluconnect/j22;-><init>()V

    invoke-virtual {p0}, Lbluconnect/j22;->u()V

    return-void
.end method

.method public final f()V
    .locals 5

    sget-object v0, Lbluconnect/wni;->r:Ljava/util/Queue;

    invoke-interface {v0}, Ljava/util/Queue;->poll()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [B

    iput-object v0, p0, Lbluconnect/wni;->e:[B

    if-eqz v0, :cond_0

    sget-object v0, Lbluconnect/j22;->f:Ljava/lang/String;

    invoke-static {v0}, Lbluconnect/fjp;->t(Ljava/lang/String;)Lbluconnect/fjp$c;

    move-result-object v0

    iget-object v1, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    iget-object v2, p0, Lbluconnect/wni;->e:[B

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lbluconnect/toh;->b([BLjava/lang/String;)Ljava/lang/String;

    move-result-object v1

    filled-new-array {v1}, [Ljava/lang/Object;

    move-result-object v1

    const-string v2, "sending.. %s"

    invoke-virtual {v0, v2, v1}, Lbluconnect/fjp$c;->a(Ljava/lang/String;[Ljava/lang/Object;)V

    iget-object v0, p0, Lbluconnect/wni;->o:Lbluconnect/kdk;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "sending.. "

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget-object v2, p0, Lbluconnect/wni;->f:Lbluconnect/toh;

    iget-object v4, p0, Lbluconnect/wni;->e:[B

    invoke-virtual {v2, v4, v3}, Lbluconnect/toh;->b([BLjava/lang/String;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    iget-boolean v2, p0, Lbluconnect/wni;->a:Z

    invoke-virtual {v0, v1, v2}, Lbluconnect/kdk;->a(Ljava/lang/String;Z)V

    sget-object v0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Landroid/bluetooth/BluetoothGattCharacteristic;->setWriteType(I)V

    sget-object v0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    iget-object p0, p0, Lbluconnect/wni;->e:[B

    invoke-virtual {v0, p0}, Landroid/bluetooth/BluetoothGattCharacteristic;->setValue([B)Z

    sget-object p0, Lbluconnect/dma;->y:Landroid/bluetooth/BluetoothGatt;

    sget-object v0, Lbluconnect/dma;->z:Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {p0, v0}, Landroid/bluetooth/BluetoothGatt;->writeCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    :cond_0
    return-void
.end method

.method public final g([B)Z
    .locals 4

    const/16 p0, 0x12

    new-array v0, p0, [B

    const/4 v1, 0x0

    move v2, v1

    :goto_0
    if-ge v2, p0, :cond_0

    aget-byte v3, p1, v2

    aput-byte v3, v0, v2

    add-int/lit8 v2, v2, 0x1

    goto :goto_0

    :cond_0
    :try_start_0
    invoke-static {v0}, Lbluconnect/yj3;->a([B)[B

    move-result-object v0

    aget-byte v2, v0, v1

    aget-byte p0, p1, p0

    if-ne v2, p0, :cond_1

    const/4 p0, 0x1

    aget-byte v0, v0, p0

    const/16 v2, 0x13

    aget-byte p1, p1, v2
    :try_end_0
    .catch Ljava/io/IOException; {:try_start_0 .. :try_end_0} :catch_0

    if-ne v0, p1, :cond_1

    return p0

    :catch_0
    move-exception p0

    goto :goto_1

    :cond_1
    return v1

    :goto_1
    invoke-static {p0}, Lbluconnect/fjp;->i(Ljava/lang/Throwable;)V

    return v1
.end method
