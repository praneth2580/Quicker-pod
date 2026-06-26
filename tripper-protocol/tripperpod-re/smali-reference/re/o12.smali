.class public final Lbluconnect/o12;
.super Ljava/lang/Object;
.source "SourceFile"

# interfaces
.implements Lbluconnect/ssb;


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lbluconnect/o12$a;
    }
.end annotation

.annotation system Ldalvik/annotation/SourceDebugExtension;
    value = "SMAP\nBleManager.kt\nKotlin\n*S Kotlin\n*F\n+ 1 BleManager.kt\ncom/royalenfield/bluetooth/ble/BleManager\n+ 2 fake.kt\nkotlin/jvm/internal/FakeKt\n*L\n1#1,614:1\n1#2:615\n*E\n"
.end annotation

.annotation build Lkotlin/jvm/internal/SourceDebugExtension;
    value = {
        "SMAP\nBleManager.kt\nKotlin\n*S Kotlin\n*F\n+ 1 BleManager.kt\ncom/royalenfield/bluetooth/ble/BleManager\n+ 2 fake.kt\nkotlin/jvm/internal/FakeKt\n*L\n1#1,614:1\n1#2:615\n*E\n"
    }
.end annotation


# static fields
.field public static final r:Lbluconnect/o12$a;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public static final s:Ljava/util/Queue;
    .annotation build Lbluconnect/ejh;
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Queue<",
            "[B>;"
        }
    .end annotation
.end field


# instance fields
.field public a:Landroid/bluetooth/BluetoothGattCharacteristic;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field

.field public b:Landroid/bluetooth/BluetoothGatt;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field

.field public c:Lbluconnect/afi;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field

.field public d:Lbluconnect/za7;

.field public e:Lbluconnect/jxa;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public f:Lbluconnect/f42;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public final g:Landroid/os/ParcelUuid;

.field public h:Landroid/content/Context;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field

.field public i:Landroid/bluetooth/BluetoothManager;

.field public j:Landroid/bluetooth/BluetoothAdapter;

.field public k:Landroid/bluetooth/le/BluetoothLeScanner;

.field public l:Ljava/lang/String;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field

.field public m:Landroid/bluetooth/BluetoothDevice;

.field public n:Landroid/os/Handler;

.field public o:Z

.field public p:Z

.field public final q:Ljava/lang/Thread;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field


# direct methods
.method static constructor <clinit>()V
    .locals 1

    new-instance v0, Lbluconnect/o12$a;

    invoke-direct {v0}, Ljava/lang/Object;-><init>()V

    sput-object v0, Lbluconnect/o12;->r:Lbluconnect/o12$a;

    new-instance v0, Ljava/util/concurrent/ConcurrentLinkedQueue;

    invoke-direct {v0}, Ljava/util/concurrent/ConcurrentLinkedQueue;-><init>()V

    sput-object v0, Lbluconnect/o12;->s:Ljava/util/Queue;

    return-void
.end method

.method public constructor <init>()V
    .locals 2

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Lbluconnect/jxa;

    invoke-direct {v0, p0}, Lbluconnect/jxa;-><init>(Lbluconnect/o12;)V

    iput-object v0, p0, Lbluconnect/o12;->e:Lbluconnect/jxa;

    new-instance v0, Lbluconnect/f42;

    invoke-direct {v0, p0}, Lbluconnect/f42;-><init>(Lbluconnect/o12;)V

    iput-object v0, p0, Lbluconnect/o12;->f:Lbluconnect/f42;

    const-string v0, "01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0"

    invoke-static {v0}, Landroid/os/ParcelUuid;->fromString(Ljava/lang/String;)Landroid/os/ParcelUuid;

    move-result-object v0

    iput-object v0, p0, Lbluconnect/o12;->g:Landroid/os/ParcelUuid;

    const/4 v0, 0x1

    iput-boolean v0, p0, Lbluconnect/o12;->o:Z

    new-instance v0, Ljava/lang/Thread;

    new-instance v1, Lbluconnect/k12;

    invoke-direct {v1, p0}, Lbluconnect/k12;-><init>(Lbluconnect/o12;)V

    invoke-direct {v0, v1}, Ljava/lang/Thread;-><init>(Ljava/lang/Runnable;)V

    iput-object v0, p0, Lbluconnect/o12;->q:Ljava/lang/Thread;

    return-void
.end method

.method public static final d0(Lbluconnect/o12;)V
    .locals 1

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_0

    invoke-virtual {p0, v0}, Lbluconnect/o12;->b(Landroid/content/Context;)V

    :cond_0
    invoke-virtual {p0}, Lbluconnect/o12;->A()Landroid/os/Handler;

    move-result-object p0

    const/4 v0, 0x0

    invoke-virtual {p0, v0}, Landroid/os/Handler;->removeCallbacksAndMessages(Ljava/lang/Object;)V

    return-void
.end method

.method public static final e0(Lbluconnect/o12;)V
    .locals 1

    :cond_0
    :goto_0
    iget-object v0, p0, Lbluconnect/o12;->a:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz v0, :cond_0

    iget-boolean v0, p0, Lbluconnect/o12;->p:Z

    if-eqz v0, :cond_0

    sget-object v0, Lbluconnect/o12;->s:Ljava/util/Queue;

    invoke-interface {v0}, Ljava/util/Queue;->poll()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [B

    if-eqz v0, :cond_0

    invoke-virtual {p0, v0}, Lbluconnect/o12;->f([B)V

    goto :goto_0
.end method

.method public static synthetic n(Lbluconnect/o12;)V
    .locals 0

    invoke-static {p0}, Lbluconnect/o12;->e0(Lbluconnect/o12;)V

    const/4 p0, 0x0

    throw p0
.end method

.method public static synthetic o(Lbluconnect/o12;)V
    .locals 0

    invoke-static {p0}, Lbluconnect/o12;->d0(Lbluconnect/o12;)V

    return-void
.end method

.method public static final synthetic p()Ljava/util/Queue;
    .locals 1

    sget-object v0, Lbluconnect/o12;->s:Ljava/util/Queue;

    return-object v0
.end method


# virtual methods
.method public final A()Landroid/os/Handler;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->n:Landroid/os/Handler;

    if-eqz p0, :cond_0

    return-object p0

    :cond_0
    const-string p0, "handler"

    invoke-static {p0}, Lkotlin/jvm/internal/Intrinsics;->S(Ljava/lang/String;)V

    const/4 p0, 0x0

    throw p0
.end method

.method public final B()Landroid/bluetooth/BluetoothAdapter;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->j:Landroid/bluetooth/BluetoothAdapter;

    if-eqz p0, :cond_0

    return-object p0

    :cond_0
    const-string p0, "mBluetoothAdapter"

    invoke-static {p0}, Lkotlin/jvm/internal/Intrinsics;->S(Ljava/lang/String;)V

    const/4 p0, 0x0

    throw p0
.end method

.method public final C()Landroid/bluetooth/BluetoothGatt;
    .locals 0
    .annotation build Lbluconnect/smh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    return-object p0
.end method

.method public final D()Landroid/bluetooth/BluetoothManager;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->i:Landroid/bluetooth/BluetoothManager;

    if-eqz p0, :cond_0

    return-object p0

    :cond_0
    const-string p0, "mBluetoothManager"

    invoke-static {p0}, Lkotlin/jvm/internal/Intrinsics;->S(Ljava/lang/String;)V

    const/4 p0, 0x0

    throw p0
.end method

.method public final E()Landroid/content/Context;
    .locals 0
    .annotation build Lbluconnect/smh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    return-object p0
.end method

.method public final F()Z
    .locals 0

    iget-boolean p0, p0, Lbluconnect/o12;->o:Z

    return p0
.end method

.method public final G()Landroid/os/ParcelUuid;
    .locals 0

    iget-object p0, p0, Lbluconnect/o12;->g:Landroid/os/ParcelUuid;

    return-object p0
.end method

.method public final H()Ljava/lang/Thread;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->q:Ljava/lang/Thread;

    return-object p0
.end method

.method public final I()Z
    .locals 0

    iget-boolean p0, p0, Lbluconnect/o12;->p:Z

    return p0
.end method

.method public final J(Landroid/bluetooth/BluetoothGattCharacteristic;)V
    .locals 2
    .param p1    # Landroid/bluetooth/BluetoothGattCharacteristic;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "chara"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    const/4 v0, 0x1

    iput-boolean v0, p0, Lbluconnect/o12;->p:Z

    iput-object p1, p0, Lbluconnect/o12;->a:Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {p0}, Lbluconnect/o12;->start()V

    iget-object p1, p0, Lbluconnect/o12;->l:Ljava/lang/String;

    iget-object v1, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    invoke-static {p1, v1}, Lbluconnect/ri1;->d(Ljava/lang/String;Landroid/content/Context;)Z

    move-result p1

    if-nez p1, :cond_0

    const/4 p1, 0x0

    invoke-virtual {p0, p1}, Lbluconnect/o12;->N(Z)V

    return-void

    :cond_0
    invoke-virtual {p0, v0}, Lbluconnect/o12;->N(Z)V

    return-void
.end method

.method public final K(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;I)V
    .locals 0
    .param p1    # Landroid/bluetooth/BluetoothGatt;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .param p2    # Landroid/bluetooth/BluetoothGattCharacteristic;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string p3, "gatt"

    invoke-static {p1, p3}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    const-string p1, "characteristic"

    invoke-static {p2, p1}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    sget-object p1, Lbluconnect/o12;->s:Ljava/util/Queue;

    invoke-interface {p1}, Ljava/util/Queue;->poll()Ljava/lang/Object;

    move-result-object p1

    check-cast p1, [B

    if-eqz p1, :cond_0

    invoke-virtual {p0, p1}, Lbluconnect/o12;->f([B)V

    return-void

    :cond_0
    const/4 p1, 0x1

    iput-boolean p1, p0, Lbluconnect/o12;->o:Z

    return-void
.end method

.method public final L(Landroid/bluetooth/BluetoothGatt;II)V
    .locals 6
    .param p1    # Landroid/bluetooth/BluetoothGatt;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "gatt"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_0

    const-string v1, "android.permission.BLUETOOTH_CONNECT"

    invoke-static {v0, v1}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result v0

    if-eqz v0, :cond_0

    goto/16 :goto_1

    :cond_0
    iput-object p1, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v0

    iget-object v1, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    invoke-virtual {v0, v1}, Lbluconnect/ti1;->h(Landroid/bluetooth/BluetoothGatt;)V

    new-instance v0, Landroid/content/Intent;

    const-string v1, "updateconnection"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const/4 v1, 0x2

    const-string v2, "devicename"

    const-string v3, "connected"

    const-string v4, "deviceaddress"

    if-ne p3, v1, :cond_3

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/ti1;->e()Z

    move-result v1

    if-nez v1, :cond_3

    const-string v1, "BLECONNECTSTATE_CONNECTED"

    sget-object v5, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v5, v1}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    sget-object v1, Lbluconnect/o12;->s:Ljava/util/Queue;

    invoke-interface {v1}, Ljava/util/Collection;->clear()V

    iget-object v1, p0, Lbluconnect/o12;->q:Ljava/lang/Thread;

    invoke-virtual {v1}, Ljava/lang/Thread;->interrupt()V

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v1

    const/4 v5, 0x1

    invoke-virtual {v1, v5}, Lbluconnect/ti1;->k(Z)V

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v1

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothDevice;->getAddress()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v4, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    invoke-virtual {v0, v3, v5}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Z)Landroid/content/Intent;

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v1

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothDevice;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v2, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    iget-object v1, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    if-eqz v1, :cond_1

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothGatt;->discoverServices()Z

    :cond_1
    iget-object v1, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v1, :cond_2

    invoke-static {v1}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object v1

    invoke-virtual {v1, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_2
    iget-object v1, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v1, :cond_3

    invoke-virtual {p0, v1}, Lbluconnect/o12;->b(Landroid/content/Context;)V

    :cond_3
    if-nez p3, :cond_6

    const/16 p3, 0x85

    if-eq p2, p3, :cond_4

    const/16 p3, 0x101

    if-eq p2, p3, :cond_4

    goto :goto_0

    :cond_4
    const-string p3, "BLECONNECTSTATE_DISCONNECTED 133 or 257"

    sget-object v1, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v1, p3}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    invoke-virtual {p0}, Lbluconnect/o12;->disconnect()V

    :goto_0
    const-string p3, "BLECONNECTSTATE_DISCONNECTED"

    sget-object v1, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v1, p3}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object p3

    invoke-virtual {p3}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object p3

    if-eqz p3, :cond_5

    invoke-virtual {p3}, Landroid/bluetooth/BluetoothGatt;->close()V

    :cond_5
    const/4 p3, 0x0

    iput-boolean p3, p0, Lbluconnect/o12;->p:Z

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v1

    invoke-virtual {v1, p3}, Lbluconnect/ti1;->k(Z)V

    sget-object v1, Lbluconnect/o12;->s:Ljava/util/Queue;

    invoke-interface {v1}, Ljava/util/Collection;->clear()V

    iget-object v1, p0, Lbluconnect/o12;->q:Ljava/lang/Thread;

    invoke-virtual {v1}, Ljava/lang/Thread;->interrupt()V

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v1

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothDevice;->getAddress()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v4, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    invoke-virtual {v0, v3, p3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Z)Landroid/content/Intent;

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object p1

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothDevice;->getName()Ljava/lang/String;

    move-result-object p1

    invoke-virtual {v0, v2, p1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    const-string p1, "status"

    invoke-virtual {v0, p1, p2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;I)Landroid/content/Intent;

    iget-object p0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz p0, :cond_6

    invoke-static {p0}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object p0

    invoke-virtual {p0, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_6
    :goto_1
    return-void
.end method

.method public final M()V
    .locals 4

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_2

    const-string v1, "android.permission.BLUETOOTH_CONNECT"

    invoke-static {v0, v1}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result v0

    if-nez v0, :cond_2

    new-instance v0, Lbluconnect/f42;

    invoke-direct {v0, p0}, Lbluconnect/f42;-><init>(Lbluconnect/o12;)V

    iput-object v0, p0, Lbluconnect/o12;->f:Lbluconnect/f42;

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    const-string v2, "bluetooth"

    invoke-virtual {v0, v2}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    goto :goto_0

    :cond_0
    move-object v0, v1

    :goto_0
    const-string v2, "null cannot be cast to non-null type android.bluetooth.BluetoothManager"

    invoke-static {v0, v2}, Lkotlin/jvm/internal/Intrinsics;->n(Ljava/lang/Object;Ljava/lang/String;)V

    check-cast v0, Landroid/bluetooth/BluetoothManager;

    iput-object v0, p0, Lbluconnect/o12;->i:Landroid/bluetooth/BluetoothManager;

    invoke-virtual {p0}, Lbluconnect/o12;->D()Landroid/bluetooth/BluetoothManager;

    iget-object v0, p0, Lbluconnect/o12;->f:Lbluconnect/f42;

    if-eqz v0, :cond_2

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_2

    invoke-virtual {p0}, Lbluconnect/o12;->D()Landroid/bluetooth/BluetoothManager;

    move-result-object v0

    iget-object v2, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v2, :cond_1

    invoke-virtual {v2}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object v1

    :cond_1
    iget-object p0, p0, Lbluconnect/o12;->f:Lbluconnect/f42;

    invoke-virtual {v0, v1, p0}, Landroid/bluetooth/BluetoothManager;->openGattServer(Landroid/content/Context;Landroid/bluetooth/BluetoothGattServerCallback;)Landroid/bluetooth/BluetoothGattServer;

    move-result-object p0

    new-instance v0, Landroid/bluetooth/BluetoothGattCharacteristic;

    sget-object v1, Lbluconnect/jxa;->e:Ljava/util/UUID;

    const/4 v2, 0x5

    const/16 v3, 0x10

    invoke-direct {v0, v1, v2, v3}, Landroid/bluetooth/BluetoothGattCharacteristic;-><init>(Ljava/util/UUID;II)V

    new-instance v1, Landroid/bluetooth/BluetoothGattService;

    sget-object v2, Lbluconnect/jxa;->d:Ljava/util/UUID;

    const/4 v3, 0x0

    invoke-direct {v1, v2, v3}, Landroid/bluetooth/BluetoothGattService;-><init>(Ljava/util/UUID;I)V

    invoke-virtual {v1, v0}, Landroid/bluetooth/BluetoothGattService;->addCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    if-eqz p0, :cond_2

    invoke-virtual {p0, v1}, Landroid/bluetooth/BluetoothGattServer;->addService(Landroid/bluetooth/BluetoothGattService;)Z

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v0

    invoke-virtual {v0, p0}, Lbluconnect/ti1;->i(Landroid/bluetooth/BluetoothGattServer;)V

    :cond_2
    return-void
.end method

.method public final N(Z)V
    .locals 5

    const-string p0, "BLECONNECTSENDPINSHOWMSG"

    sget-object v0, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v0, p0}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    const/16 p0, 0x14

    new-array p0, p0, [B

    const/16 v0, 0x21

    const/4 v1, 0x0

    aput-byte v0, p0, v1

    const/4 v0, 0x1

    if-eqz p1, :cond_0

    aput-byte v1, p0, v0

    goto :goto_0

    :cond_0
    aput-byte v0, p0, v0

    :goto_0
    const/4 p1, 0x2

    aput-byte v1, p0, p1

    const/4 p1, 0x3

    aput-byte v1, p0, p1

    const/4 p1, 0x4

    aput-byte v1, p0, p1

    const/4 p1, 0x5

    aput-byte v1, p0, p1

    const/4 p1, 0x6

    aput-byte v1, p0, p1

    const/16 p1, 0x12

    new-array v2, p1, [B

    move v3, v1

    :goto_1
    if-ge v3, p1, :cond_1

    aget-byte v4, p0, v3

    aput-byte v4, v2, v3

    add-int/lit8 v3, v3, 0x1

    goto :goto_1

    :cond_1
    invoke-static {v2}, Lbluconnect/xj3;->a([B)[B

    move-result-object v2

    aget-byte v1, v2, v1

    aput-byte v1, p0, p1

    const/16 p1, 0x13

    aget-byte v0, v2, v0

    aput-byte v0, p0, p1

    sget-object p1, Lbluconnect/o12;->s:Ljava/util/Queue;

    invoke-interface {p1, p0}, Ljava/util/Queue;->offer(Ljava/lang/Object;)Z

    return-void
.end method

.method public final O()V
    .locals 6

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_8

    const-string v1, "android.permission.BLUETOOTH_CONNECT"

    invoke-static {v0, v1}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result v0

    if-nez v0, :cond_8

    const-string v0, "BLECONNECTSENDTIMESHOWMSG"

    sget-object v1, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v1, v0}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    new-instance v0, Landroid/content/Intent;

    const-string v1, "pinAuth"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "auth"

    const/4 v2, 0x1

    invoke-virtual {v0, v1, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Z)Landroid/content/Intent;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v1

    const/4 v3, 0x0

    if-eqz v1, :cond_0

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v1

    if-eqz v1, :cond_0

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothDevice;->getName()Ljava/lang/String;

    move-result-object v1

    goto :goto_0

    :cond_0
    move-object v1, v3

    :goto_0
    const-string v4, "deviceName"

    invoke-virtual {v0, v4, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v1

    if-eqz v1, :cond_1

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v1

    if-eqz v1, :cond_1

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothDevice;->getAddress()Ljava/lang/String;

    move-result-object v3

    :cond_1
    const-string v1, "deviceAddress"

    invoke-virtual {v0, v1, v3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    iget-object v1, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v1, :cond_2

    invoke-static {v1}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object v1

    invoke-virtual {v1, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_2
    const/16 v0, 0x14

    new-array v0, v0, [B

    const/16 v1, 0x50

    const/4 v3, 0x0

    aput-byte v1, v0, v3

    invoke-static {}, Ljava/util/Calendar;->getInstance()Ljava/util/Calendar;

    move-result-object v1

    invoke-virtual {v1}, Ljava/util/Calendar;->getTime()Ljava/util/Date;

    move-result-object v1

    invoke-virtual {v1}, Ljava/util/Date;->getHours()I

    move-result v4

    invoke-virtual {v1}, Ljava/util/Date;->getMinutes()I

    move-result v1

    iget-object p0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    invoke-static {p0}, Landroid/text/format/DateFormat;->is24HourFormat(Landroid/content/Context;)Z

    move-result p0

    const/4 v5, 0x2

    if-eqz p0, :cond_3

    move p0, v3

    goto :goto_3

    :cond_3
    const/16 p0, 0xc

    if-nez v4, :cond_4

    move v4, p0

    :goto_1
    move p0, v2

    goto :goto_3

    :cond_4
    if-ge v4, p0, :cond_5

    goto :goto_1

    :cond_5
    if-ne v4, p0, :cond_6

    :goto_2
    move p0, v5

    goto :goto_3

    :cond_6
    add-int/lit8 v4, v4, -0xc

    goto :goto_2

    :goto_3
    and-int/lit8 p0, p0, 0x3

    shl-int/lit8 p0, p0, 0x6

    and-int/lit8 v4, v4, 0x3f

    or-int/2addr p0, v4

    int-to-byte p0, p0

    aput-byte p0, v0, v2

    and-int/lit16 p0, v1, 0xff

    int-to-byte p0, p0

    aput-byte p0, v0, v5

    const/16 p0, 0x12

    new-array v1, p0, [B

    move v4, v3

    :goto_4
    if-ge v4, p0, :cond_7

    aget-byte v5, v0, v4

    aput-byte v5, v1, v4

    add-int/lit8 v4, v4, 0x1

    goto :goto_4

    :cond_7
    invoke-static {v1}, Lbluconnect/xj3;->a([B)[B

    move-result-object v1

    aget-byte v3, v1, v3

    aput-byte v3, v0, p0

    const/16 p0, 0x13

    aget-byte v1, v1, v2

    aput-byte v1, v0, p0

    sget-object p0, Lbluconnect/o12;->s:Ljava/util/Queue;

    invoke-interface {p0, v0}, Ljava/util/Queue;->offer(Ljava/lang/Object;)Z

    :cond_8
    return-void
.end method

.method public final P(Landroid/bluetooth/le/BluetoothLeScanner;)V
    .locals 1
    .param p1    # Landroid/bluetooth/le/BluetoothLeScanner;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "<set-?>"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->k:Landroid/bluetooth/le/BluetoothLeScanner;

    return-void
.end method

.method public final Q(Landroid/bluetooth/BluetoothGattCharacteristic;)V
    .locals 0
    .param p1    # Landroid/bluetooth/BluetoothGattCharacteristic;
        .annotation build Lbluconnect/smh;
        .end annotation
    .end param

    iput-object p1, p0, Lbluconnect/o12;->a:Landroid/bluetooth/BluetoothGattCharacteristic;

    return-void
.end method

.method public final R(Z)V
    .locals 0

    iput-boolean p1, p0, Lbluconnect/o12;->p:Z

    return-void
.end method

.method public final S(Lbluconnect/za7;)V
    .locals 1
    .param p1    # Lbluconnect/za7;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "<set-?>"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->d:Lbluconnect/za7;

    return-void
.end method

.method public final T(Lbluconnect/jxa;)V
    .locals 1
    .param p1    # Lbluconnect/jxa;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "<set-?>"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->e:Lbluconnect/jxa;

    return-void
.end method

.method public final U(Lbluconnect/f42;)V
    .locals 1
    .param p1    # Lbluconnect/f42;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "<set-?>"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->f:Lbluconnect/f42;

    return-void
.end method

.method public final V(Landroid/os/Handler;)V
    .locals 1
    .param p1    # Landroid/os/Handler;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "<set-?>"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->n:Landroid/os/Handler;

    return-void
.end method

.method public final W(Landroid/bluetooth/BluetoothAdapter;)V
    .locals 1
    .param p1    # Landroid/bluetooth/BluetoothAdapter;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "<set-?>"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->j:Landroid/bluetooth/BluetoothAdapter;

    return-void
.end method

.method public final X(Landroid/bluetooth/BluetoothGatt;)V
    .locals 0
    .param p1    # Landroid/bluetooth/BluetoothGatt;
        .annotation build Lbluconnect/smh;
        .end annotation
    .end param

    iput-object p1, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    return-void
.end method

.method public final Y(Landroid/bluetooth/BluetoothManager;)V
    .locals 1
    .param p1    # Landroid/bluetooth/BluetoothManager;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "<set-?>"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->i:Landroid/bluetooth/BluetoothManager;

    return-void
.end method

.method public final Z(Landroid/content/Context;)V
    .locals 0
    .param p1    # Landroid/content/Context;
        .annotation build Lbluconnect/smh;
        .end annotation
    .end param

    iput-object p1, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    return-void
.end method

.method public a(Z)V
    .locals 0

    iget-object p0, p0, Lbluconnect/o12;->c:Lbluconnect/afi;

    if-eqz p0, :cond_0

    invoke-interface {p0, p1}, Lbluconnect/afi;->a(Z)V

    :cond_0
    return-void
.end method

.method public final a0(Z)V
    .locals 0

    iput-boolean p1, p0, Lbluconnect/o12;->o:Z

    return-void
.end method

.method public b(Landroid/content/Context;)V
    .locals 2
    .param p1    # Landroid/content/Context;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "context"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    :try_start_0
    invoke-virtual {p0}, Lbluconnect/o12;->b0()V

    invoke-virtual {p0}, Lbluconnect/o12;->t()Landroid/bluetooth/le/BluetoothLeScanner;

    invoke-virtual {p0}, Lbluconnect/o12;->B()Landroid/bluetooth/BluetoothAdapter;

    move-result-object p1

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothAdapter;->isEnabled()Z

    move-result p1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    const-string v0, "scanStop"

    if-eqz p1, :cond_0

    :try_start_1
    iget-object p1, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz p1, :cond_2

    const-string v1, "android.permission.BLUETOOTH_SCAN"

    invoke-static {p1, v1}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result p1

    if-nez p1, :cond_2

    invoke-virtual {p0}, Lbluconnect/o12;->t()Landroid/bluetooth/le/BluetoothLeScanner;

    move-result-object p1

    invoke-virtual {p0}, Lbluconnect/o12;->w()Lbluconnect/za7;

    move-result-object v1

    invoke-virtual {p1, v1}, Landroid/bluetooth/le/BluetoothLeScanner;->stopScan(Landroid/bluetooth/le/ScanCallback;)V

    invoke-virtual {p0}, Lbluconnect/o12;->t()Landroid/bluetooth/le/BluetoothLeScanner;

    move-result-object p1

    invoke-virtual {p0}, Lbluconnect/o12;->w()Lbluconnect/za7;

    move-result-object v1

    invoke-virtual {p1, v1}, Landroid/bluetooth/le/BluetoothLeScanner;->flushPendingScanResults(Landroid/bluetooth/le/ScanCallback;)V

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object p1

    const/4 v1, 0x0

    invoke-virtual {p1, v1}, Lbluconnect/ti1;->m(Z)V

    new-instance p1, Landroid/content/Intent;

    invoke-direct {p1, v0}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_1

    invoke-static {v0}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object v0

    invoke-virtual {v0, p1}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    goto :goto_0

    :cond_0
    new-instance p1, Landroid/content/Intent;

    invoke-direct {p1, v0}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_1

    invoke-static {v0}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object v0

    invoke-virtual {v0, p1}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_1
    :goto_0
    invoke-virtual {p0}, Lbluconnect/o12;->A()Landroid/os/Handler;

    move-result-object p0

    const/4 p1, 0x0

    invoke-virtual {p0, p1}, Landroid/os/Handler;->removeCallbacksAndMessages(Ljava/lang/Object;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    :catch_0
    :cond_2
    return-void
.end method

.method public final b0()V
    .locals 2

    :try_start_0
    sget-object v0, Lbluconnect/p9k;->e1:Landroid/content/Context;

    iput-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_0

    const-string v1, "bluetooth"

    invoke-virtual {v0, v1}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    const-string v1, "null cannot be cast to non-null type android.bluetooth.BluetoothManager"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->n(Ljava/lang/Object;Ljava/lang/String;)V

    check-cast v0, Landroid/bluetooth/BluetoothManager;

    iput-object v0, p0, Lbluconnect/o12;->i:Landroid/bluetooth/BluetoothManager;

    invoke-virtual {p0}, Lbluconnect/o12;->D()Landroid/bluetooth/BluetoothManager;

    move-result-object v0

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothManager;->getAdapter()Landroid/bluetooth/BluetoothAdapter;

    move-result-object v0

    const-string v1, "getAdapter(...)"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->o(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object v0, p0, Lbluconnect/o12;->j:Landroid/bluetooth/BluetoothAdapter;

    invoke-virtual {p0}, Lbluconnect/o12;->B()Landroid/bluetooth/BluetoothAdapter;

    move-result-object v0

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothAdapter;->getBluetoothLeScanner()Landroid/bluetooth/le/BluetoothLeScanner;

    move-result-object v0

    if-eqz v0, :cond_1

    invoke-virtual {p0}, Lbluconnect/o12;->B()Landroid/bluetooth/BluetoothAdapter;

    move-result-object v0

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothAdapter;->getBluetoothLeScanner()Landroid/bluetooth/le/BluetoothLeScanner;

    move-result-object v0

    const-string v1, "getBluetoothLeScanner(...)"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->o(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object v0, p0, Lbluconnect/o12;->k:Landroid/bluetooth/le/BluetoothLeScanner;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    :cond_1
    return-void

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/Throwable;->printStackTrace()V

    sget-object p0, Lkotlin/Unit;->a:Lkotlin/Unit;

    return-void
.end method

.method public c(I)V
    .locals 2

    new-instance v0, Landroid/content/Intent;

    const-string v1, "otapstatus"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "status"

    invoke-virtual {v0, v1, p1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;I)Landroid/content/Intent;

    iget-object p0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz p0, :cond_0

    invoke-static {p0}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object p0

    invoke-virtual {p0, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_0
    return-void
.end method

.method public final c0()V
    .locals 4

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_0

    const-string v1, "android.permission.BLUETOOTH_SCAN"

    invoke-static {v0, v1}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result v0

    if-nez v0, :cond_0

    :try_start_0
    new-instance v0, Landroid/os/Handler;

    invoke-direct {v0}, Landroid/os/Handler;-><init>()V

    iput-object v0, p0, Lbluconnect/o12;->n:Landroid/os/Handler;

    invoke-virtual {p0}, Lbluconnect/o12;->A()Landroid/os/Handler;

    move-result-object v0

    new-instance v1, Lbluconnect/i12;

    invoke-direct {v1, p0}, Lbluconnect/i12;-><init>(Lbluconnect/o12;)V

    const-wide/32 v2, 0xea60

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v0

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Lbluconnect/ti1;->m(Z)V

    invoke-virtual {p0}, Lbluconnect/o12;->t()Landroid/bluetooth/le/BluetoothLeScanner;

    move-result-object v0

    invoke-virtual {p0}, Lbluconnect/o12;->q()Ljava/util/List;

    move-result-object v1

    invoke-virtual {p0}, Lbluconnect/o12;->r()Landroid/bluetooth/le/ScanSettings;

    move-result-object v2

    invoke-virtual {p0}, Lbluconnect/o12;->w()Lbluconnect/za7;

    move-result-object p0

    invoke-virtual {v0, v1, v2, p0}, Landroid/bluetooth/le/BluetoothLeScanner;->startScan(Ljava/util/List;Landroid/bluetooth/le/ScanSettings;Landroid/bluetooth/le/ScanCallback;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/Throwable;->printStackTrace()V

    :cond_0
    return-void
.end method

.method public d(Landroid/content/Context;)V
    .locals 1
    .param p1    # Landroid/content/Context;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "context"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-virtual {p0}, Lbluconnect/o12;->b0()V

    invoke-virtual {p0}, Lbluconnect/o12;->B()Landroid/bluetooth/BluetoothAdapter;

    move-result-object p1

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothAdapter;->isEnabled()Z

    move-result p1

    if-eqz p1, :cond_0

    invoke-virtual {p0}, Lbluconnect/o12;->M()V

    :cond_0
    return-void
.end method

.method public disconnect()V
    .locals 2

    :try_start_0
    invoke-virtual {p0}, Lbluconnect/o12;->b0()V

    sget-object v0, Lbluconnect/p9k;->e1:Landroid/content/Context;

    const-string v1, "android.permission.BLUETOOTH_CONNECT"

    invoke-static {v0, v1}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result v0

    if-eqz v0, :cond_0

    return-void

    :cond_0
    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v0

    if-eqz v0, :cond_1

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v0

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothGatt;->disconnect()V

    :cond_1
    iget-object p0, p0, Lbluconnect/o12;->q:Ljava/lang/Thread;

    invoke-virtual {p0}, Ljava/lang/Thread;->interrupt()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/Throwable;->printStackTrace()V

    return-void
.end method

.method public e()V
    .locals 2

    sget-object v0, Lbluconnect/p9k;->e1:Landroid/content/Context;

    if-nez v0, :cond_0

    goto :goto_0

    :cond_0
    iput-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    const-string v1, "bluetooth"

    invoke-virtual {v0, v1}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    const-string v1, "null cannot be cast to non-null type android.bluetooth.BluetoothManager"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->n(Ljava/lang/Object;Ljava/lang/String;)V

    check-cast v0, Landroid/bluetooth/BluetoothManager;

    iput-object v0, p0, Lbluconnect/o12;->i:Landroid/bluetooth/BluetoothManager;

    invoke-virtual {p0}, Lbluconnect/o12;->D()Landroid/bluetooth/BluetoothManager;

    move-result-object v0

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothManager;->getAdapter()Landroid/bluetooth/BluetoothAdapter;

    move-result-object v0

    const-string v1, "getAdapter(...)"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->o(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object v0, p0, Lbluconnect/o12;->j:Landroid/bluetooth/BluetoothAdapter;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/ti1;->g()Z

    move-result v0

    if-nez v0, :cond_1

    invoke-virtual {p0}, Lbluconnect/o12;->b0()V

    new-instance v0, Lbluconnect/za7;

    invoke-direct {v0}, Lbluconnect/za7;-><init>()V

    iput-object v0, p0, Lbluconnect/o12;->d:Lbluconnect/za7;

    invoke-virtual {p0}, Lbluconnect/o12;->c0()V

    :cond_1
    :goto_0
    return-void
.end method

.method public f([B)V
    .locals 2
    .param p1    # [B
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "byteArray"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_2

    const-string v1, "android.permission.BLUETOOTH_CONNECT"

    invoke-static {v0, v1}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result v0

    if-nez v0, :cond_2

    iget-object v0, p0, Lbluconnect/o12;->a:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz v0, :cond_0

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Landroid/bluetooth/BluetoothGattCharacteristic;->setWriteType(I)V

    :cond_0
    iget-object v0, p0, Lbluconnect/o12;->a:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz v0, :cond_1

    invoke-virtual {v0, p1}, Landroid/bluetooth/BluetoothGattCharacteristic;->setValue([B)Z

    :cond_1
    iget-object p1, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    if-eqz p1, :cond_2

    iget-object p0, p0, Lbluconnect/o12;->a:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz p0, :cond_2

    if-eqz p1, :cond_2

    invoke-virtual {p1, p0}, Landroid/bluetooth/BluetoothGatt;->writeCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    :cond_2
    return-void
.end method

.method public g([BLbluconnect/o12;)V
    .locals 0
    .param p1    # [B
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .param p2    # Lbluconnect/o12;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string p0, "reply"

    invoke-static {p1, p0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    const-string p0, "bleManager"

    invoke-static {p2, p0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-static {}, Lbluconnect/dma;->n()Lbluconnect/dma;

    move-result-object p0

    invoke-virtual {p0, p1}, Lbluconnect/dma;->x([B)V

    return-void
.end method

.method public h(Lbluconnect/afi;)V
    .locals 1
    .param p1    # Lbluconnect/afi;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "connectionChange"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/o12;->c:Lbluconnect/afi;

    return-void
.end method

.method public i(ZII)V
    .locals 2

    new-instance v0, Landroid/content/Intent;

    const-string v1, "otapprogress"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "status"

    invoke-virtual {v0, v1, p1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Z)Landroid/content/Intent;

    const-string p1, "completed"

    invoke-virtual {v0, p1, p2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;I)Landroid/content/Intent;

    const-string p1, "total"

    invoke-virtual {v0, p1, p3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;I)Landroid/content/Intent;

    iget-object p0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz p0, :cond_0

    invoke-static {p0}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object p0

    invoke-virtual {p0, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_0
    return-void
.end method

.method public j([B)[B
    .locals 9
    .param p1    # [B
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .annotation build Lbluconnect/ejh;
    .end annotation

    const-string p0, "bytes"

    invoke-static {p1, p0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    array-length p0, p1

    const v0, 0xffff

    const/4 v1, 0x0

    move v3, v0

    move v2, v1

    :goto_0
    const/4 v4, 0x1

    if-ge v2, p0, :cond_4

    aget-byte v5, p1, v2

    move v6, v1

    :goto_1
    const/16 v7, 0x8

    if-ge v6, v7, :cond_3

    rsub-int/lit8 v7, v6, 0x7

    shr-int v7, v5, v7

    if-ne v7, v4, :cond_0

    move v7, v4

    goto :goto_2

    :cond_0
    move v7, v1

    :goto_2
    shr-int/lit8 v8, v3, 0xf

    and-int/2addr v8, v4

    if-ne v8, v4, :cond_1

    move v8, v4

    goto :goto_3

    :cond_1
    move v8, v1

    :goto_3
    shl-int/lit8 v3, v3, 0x1

    xor-int/2addr v7, v8

    if-eqz v7, :cond_2

    xor-int/lit16 v3, v3, 0x1021

    :cond_2
    add-int/lit8 v6, v6, 0x1

    goto :goto_1

    :cond_3
    add-int/lit8 v2, v2, 0x1

    goto :goto_0

    :cond_4
    and-int p0, v3, v0

    const/4 p1, 0x4

    invoke-static {p1}, Ljava/nio/ByteBuffer;->allocate(I)Ljava/nio/ByteBuffer;

    move-result-object p1

    invoke-virtual {p1, p0}, Ljava/nio/ByteBuffer;->putInt(I)Ljava/nio/ByteBuffer;

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->array()[B

    move-result-object p0

    const/4 p1, 0x2

    aget-byte v0, p0, p1

    const/4 v2, 0x3

    aget-byte p0, p0, v2

    new-array p1, p1, [B

    aput-byte v0, p1, v1

    aput-byte p0, p1, v4

    return-object p1
.end method

.method public k(Ljava/lang/String;Z)V
    .locals 3
    .param p1    # Ljava/lang/String;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .annotation build Lbluconnect/efr;
    .end annotation

    const-string v0, "address"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-virtual {p0}, Lbluconnect/o12;->b0()V

    iput-object p1, p0, Lbluconnect/o12;->l:Ljava/lang/String;

    invoke-virtual {p0, p1}, Lbluconnect/o12;->v(Ljava/lang/String;)Landroid/bluetooth/BluetoothDevice;

    move-result-object v0

    iput-object v0, p0, Lbluconnect/o12;->m:Landroid/bluetooth/BluetoothDevice;

    const-string v0, "BLECONNECT address "

    invoke-static {v0, p1}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object p1

    invoke-virtual {p1}, Lbluconnect/ti1;->e()Z

    move-result p1

    if-nez p1, :cond_2

    iget-object p1, p0, Lbluconnect/o12;->m:Landroid/bluetooth/BluetoothDevice;

    const/4 v0, 0x0

    const-string v1, "device"

    if-eqz p1, :cond_1

    invoke-virtual {p0}, Lbluconnect/o12;->B()Landroid/bluetooth/BluetoothAdapter;

    move-result-object p1

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothAdapter;->isEnabled()Z

    move-result p1

    if-eqz p1, :cond_2

    const-string p1, "BLECONNECT  not connected "

    const-string v2, "NotConnected"

    invoke-static {p1, v2}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    iget-object p1, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz p1, :cond_2

    const-string v2, "android.permission.BLUETOOTH_CONNECT"

    invoke-static {p1, v2}, Lbluconnect/vv5;->checkSelfPermission(Landroid/content/Context;Ljava/lang/String;)I

    move-result p1

    if-nez p1, :cond_2

    iget-object p1, p0, Lbluconnect/o12;->m:Landroid/bluetooth/BluetoothDevice;

    if-eqz p1, :cond_0

    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    iget-object v1, p0, Lbluconnect/o12;->e:Lbluconnect/jxa;

    const/4 v2, 0x2

    invoke-virtual {p1, v0, p2, v1, v2}, Landroid/bluetooth/BluetoothDevice;->connectGatt(Landroid/content/Context;ZLandroid/bluetooth/BluetoothGattCallback;I)Landroid/bluetooth/BluetoothGatt;

    move-result-object p1

    iput-object p1, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object p1

    iget-object p0, p0, Lbluconnect/o12;->b:Landroid/bluetooth/BluetoothGatt;

    invoke-virtual {p1, p0}, Lbluconnect/ti1;->h(Landroid/bluetooth/BluetoothGatt;)V

    return-void

    :cond_0
    invoke-static {v1}, Lkotlin/jvm/internal/Intrinsics;->S(Ljava/lang/String;)V

    throw v0

    :cond_1
    invoke-static {v1}, Lkotlin/jvm/internal/Intrinsics;->S(Ljava/lang/String;)V

    throw v0

    :cond_2
    return-void
.end method

.method public l([B)V
    .locals 9
    .param p1    # [B
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "command"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    new-instance v0, Landroid/content/Intent;

    const-string v1, "pinAuth"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v1, "BLECONNECTonCommandRecieved"

    sget-object v2, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v2, v1}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    const/4 v1, 0x0

    aget-byte v2, p1, v1

    const/16 v3, 0x20

    const/4 v4, 0x1

    if-ne v2, v3, :cond_9

    invoke-static {}, Lbluconnect/p9k;->y()Lbluconnect/p9k;

    move-result-object v2

    invoke-virtual {v2}, Lbluconnect/p9k;->o()Lbluconnect/p9k$b;

    move-result-object v2

    sget-object v3, Lbluconnect/p9k$b;->v2:Lbluconnect/p9k$b;

    const/4 v5, 0x0

    if-ne v2, v3, :cond_2

    sget-object v3, Lbluconnect/p9k$b;->x2:Lbluconnect/p9k$b;

    if-eq v2, v3, :cond_0

    goto :goto_0

    :cond_0
    iget-object v0, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v0, :cond_1

    sget v2, Lcom/royalenfield/reprime/renavigation/R$string;->device_already_connected:I

    invoke-virtual {v0, v2}, Landroid/content/Context;->getString(I)Ljava/lang/String;

    move-result-object v5

    :cond_1
    invoke-static {v0, v5, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    goto/16 :goto_3

    :cond_2
    :goto_0
    aget-byte v2, p1, v4

    const-string v3, "deviceAddress"

    const-string v6, "deviceName"

    const-string v7, "auth"

    if-ne v2, v4, :cond_6

    const-string v2, "BLECONNECTonCommandRecieved0x01"

    sget-object v8, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v8, v2}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    invoke-virtual {p0}, Lbluconnect/o12;->O()V

    invoke-virtual {v0, v7, v4}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Z)Landroid/content/Intent;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v2

    invoke-virtual {v2}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v2

    if-eqz v2, :cond_3

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v2

    if-eqz v2, :cond_3

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothDevice;->getName()Ljava/lang/String;

    move-result-object v2

    goto :goto_1

    :cond_3
    move-object v2, v5

    :goto_1
    invoke-virtual {v0, v6, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v2

    invoke-virtual {v2}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v2

    if-eqz v2, :cond_4

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v2

    if-eqz v2, :cond_4

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothDevice;->getAddress()Ljava/lang/String;

    move-result-object v5

    :cond_4
    invoke-virtual {v0, v3, v5}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    iget-object v2, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v2, :cond_5

    invoke-static {v2}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object v2

    invoke-virtual {v2, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_5
    new-instance v0, Landroid/content/Intent;

    const-string v2, "devicePaired"

    invoke-direct {v0, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    iget-object v2, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v2, :cond_9

    invoke-static {v2}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object v2

    invoke-virtual {v2, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    goto :goto_3

    :cond_6
    const-string v2, "BLECONNECTonCommandRecieved else"

    sget-object v8, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v8, v2}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    invoke-virtual {v0, v7, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Z)Landroid/content/Intent;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v2

    invoke-virtual {v2}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v2

    if-eqz v2, :cond_7

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v2

    if-eqz v2, :cond_7

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothDevice;->getName()Ljava/lang/String;

    move-result-object v2

    goto :goto_2

    :cond_7
    move-object v2, v5

    :goto_2
    invoke-virtual {v0, v6, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    invoke-static {}, Lbluconnect/ti1;->d()Lbluconnect/ti1;

    move-result-object v2

    invoke-virtual {v2}, Lbluconnect/ti1;->a()Landroid/bluetooth/BluetoothGatt;

    move-result-object v2

    if-eqz v2, :cond_8

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothGatt;->getDevice()Landroid/bluetooth/BluetoothDevice;

    move-result-object v2

    if-eqz v2, :cond_8

    invoke-virtual {v2}, Landroid/bluetooth/BluetoothDevice;->getAddress()Ljava/lang/String;

    move-result-object v5

    :cond_8
    invoke-virtual {v0, v3, v5}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    iget-object v2, p0, Lbluconnect/o12;->h:Landroid/content/Context;

    if-eqz v2, :cond_9

    invoke-static {v2}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object v2

    invoke-virtual {v2, v0}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_9
    :goto_3
    invoke-static {}, Lbluconnect/dma;->n()Lbluconnect/dma;

    move-result-object v0

    invoke-virtual {v0, p1}, Lbluconnect/dma;->x([B)V

    aget-byte v0, p1, v1

    const/4 v1, 0x2

    const/4 v2, 0x3

    if-ne v0, v2, :cond_a

    const-string v0, "BLECONNECTonCommandRecieved 0x03"

    sget-object v2, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v2, v0}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    aget-byte v0, p1, v4

    invoke-virtual {p0, v0}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v0

    aget-byte p1, p1, v1

    invoke-virtual {p0, p1}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object p0

    const-string p1, "."

    invoke-static {v0, p1, p0}, Lbluconnect/ywa;->a(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p0

    new-instance p1, Ljava/lang/StringBuilder;

    const-string v0, " OS "

    invoke-direct {p1, v0}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p1, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    const-string v0, "TRRR5"

    invoke-static {v0, p1}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    new-instance p1, Landroid/content/Intent;

    const-string v0, "didOSVersionReceived"

    invoke-direct {p1, v0}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v0, "Osversion"

    invoke-virtual {p1, v0, p0}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    sget-object p0, Lbluconnect/p9k;->e1:Landroid/content/Context;

    invoke-static {p0}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object p0

    invoke-virtual {p0, p1}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    return-void

    :cond_a
    const/16 v3, 0x30

    if-ne v0, v3, :cond_b

    const-string v0, "BLECONNECTonCommandRecieved 0x30"

    sget-object v3, Ljava/lang/System;->out:Ljava/io/PrintStream;

    invoke-virtual {v3, v0}, Ljava/io/PrintStream;->println(Ljava/lang/Object;)V

    aget-byte v0, p1, v4

    invoke-virtual {p0, v0}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v0

    aget-byte v1, p1, v1

    invoke-virtual {p0, v1}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v1

    aget-byte v2, p1, v2

    invoke-virtual {p0, v2}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v2

    const/4 v3, 0x4

    aget-byte v3, p1, v3

    invoke-virtual {p0, v3}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v3

    const/4 v4, 0x5

    aget-byte v4, p1, v4

    invoke-virtual {p0, v4}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v4

    const/4 v5, 0x6

    aget-byte v5, p1, v5

    invoke-virtual {p0, v5}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v5

    const/4 v6, 0x7

    aget-byte v6, p1, v6

    invoke-virtual {p0, v6}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object v6

    const/16 v7, 0x8

    aget-byte p1, p1, v7

    invoke-virtual {p0, p1}, Lbluconnect/o12;->s(B)Ljava/lang/String;

    move-result-object p0

    new-instance p1, Ljava/lang/StringBuilder;

    invoke-direct {p1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-static {p1, v5, v6, p0}, Lbluconnect/jvp;->a(Ljava/lang/StringBuilder;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p0

    new-instance p1, Ljava/lang/StringBuilder;

    const-string v0, "CHK30"

    invoke-direct {p1, v0}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p1, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-static {v0, p1}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    new-instance p1, Landroid/content/Intent;

    const-string v0, "didSerialNumberReceived"

    invoke-direct {p1, v0}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const-string v0, "SerialNo"

    invoke-virtual {p1, v0, p0}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    sget-object p0, Lbluconnect/p9k;->e1:Landroid/content/Context;

    invoke-static {p0}, Lbluconnect/nee;->b(Landroid/content/Context;)Lbluconnect/nee;

    move-result-object p0

    invoke-virtual {p0, p1}, Lbluconnect/nee;->d(Landroid/content/Intent;)Z

    :cond_b
    return-void
.end method

.method public m(Landroid/bluetooth/BluetoothGatt;II)V
    .locals 2
    .param p1    # Landroid/bluetooth/BluetoothGatt;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "gatt"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-static {}, Lbluconnect/p9k;->y()Lbluconnect/p9k;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/p9k;->o()Lbluconnect/p9k$b;

    move-result-object v0

    sget-object v1, Lbluconnect/p9k$b;->w2:Lbluconnect/p9k$b;

    if-ne v0, v1, :cond_0

    invoke-virtual {p0, p1, p2, p3}, Lbluconnect/o12;->L(Landroid/bluetooth/BluetoothGatt;II)V

    :cond_0
    return-void
.end method

.method public final q()Ljava/util/List;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/List<",
            "Landroid/bluetooth/le/ScanFilter;",
            ">;"
        }
    .end annotation

    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    new-instance v1, Landroid/bluetooth/le/ScanFilter$Builder;

    invoke-direct {v1}, Landroid/bluetooth/le/ScanFilter$Builder;-><init>()V

    iget-object p0, p0, Lbluconnect/o12;->g:Landroid/os/ParcelUuid;

    invoke-virtual {v1, p0}, Landroid/bluetooth/le/ScanFilter$Builder;->setServiceUuid(Landroid/os/ParcelUuid;)Landroid/bluetooth/le/ScanFilter$Builder;

    invoke-virtual {v1}, Landroid/bluetooth/le/ScanFilter$Builder;->build()Landroid/bluetooth/le/ScanFilter;

    move-result-object p0

    invoke-virtual {v0, p0}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    return-object v0
.end method

.method public final r()Landroid/bluetooth/le/ScanSettings;
    .locals 1

    new-instance p0, Landroid/bluetooth/le/ScanSettings$Builder;

    invoke-direct {p0}, Landroid/bluetooth/le/ScanSettings$Builder;-><init>()V

    const/4 v0, 0x0

    invoke-virtual {p0, v0}, Landroid/bluetooth/le/ScanSettings$Builder;->setScanMode(I)Landroid/bluetooth/le/ScanSettings$Builder;

    const/4 v0, 0x1

    invoke-virtual {p0, v0}, Landroid/bluetooth/le/ScanSettings$Builder;->setNumOfMatches(I)Landroid/bluetooth/le/ScanSettings$Builder;

    invoke-virtual {p0, v0}, Landroid/bluetooth/le/ScanSettings$Builder;->setScanMode(I)Landroid/bluetooth/le/ScanSettings$Builder;

    invoke-virtual {p0}, Landroid/bluetooth/le/ScanSettings$Builder;->build()Landroid/bluetooth/le/ScanSettings;

    move-result-object p0

    const-string v0, "build(...)"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->o(Ljava/lang/Object;Ljava/lang/String;)V

    return-object p0
.end method

.method public final s(B)Ljava/lang/String;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    sget-object p0, Lkotlin/jvm/internal/StringCompanionObject;->a:Lkotlin/jvm/internal/StringCompanionObject;

    invoke-static {p1}, Ljava/lang/Byte;->valueOf(B)Ljava/lang/Byte;

    move-result-object p0

    filled-new-array {p0}, [Ljava/lang/Object;

    move-result-object p0

    const/4 p1, 0x1

    invoke-static {p0, p1}, Ljava/util/Arrays;->copyOf([Ljava/lang/Object;I)[Ljava/lang/Object;

    move-result-object p0

    const-string p1, "%02x"

    invoke-static {p1, p0}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p0

    return-object p0
.end method

.method public start()V
    .locals 1

    iget-object v0, p0, Lbluconnect/o12;->q:Ljava/lang/Thread;

    invoke-virtual {v0}, Ljava/lang/Thread;->isAlive()Z

    move-result v0

    if-nez v0, :cond_0

    iget-object p0, p0, Lbluconnect/o12;->q:Ljava/lang/Thread;

    invoke-virtual {p0}, Ljava/lang/Thread;->start()V

    :cond_0
    return-void
.end method

.method public final t()Landroid/bluetooth/le/BluetoothLeScanner;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->k:Landroid/bluetooth/le/BluetoothLeScanner;

    if-eqz p0, :cond_0

    return-object p0

    :cond_0
    const-string p0, "bluetoothLeScanner"

    invoke-static {p0}, Lkotlin/jvm/internal/Intrinsics;->S(Ljava/lang/String;)V

    const/4 p0, 0x0

    throw p0
.end method

.method public final u()Landroid/bluetooth/BluetoothGattCharacteristic;
    .locals 0
    .annotation build Lbluconnect/smh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->a:Landroid/bluetooth/BluetoothGattCharacteristic;

    return-object p0
.end method

.method public final v(Ljava/lang/String;)Landroid/bluetooth/BluetoothDevice;
    .locals 0

    invoke-virtual {p0}, Lbluconnect/o12;->B()Landroid/bluetooth/BluetoothAdapter;

    move-result-object p0

    invoke-virtual {p0, p1}, Landroid/bluetooth/BluetoothAdapter;->getRemoteDevice(Ljava/lang/String;)Landroid/bluetooth/BluetoothDevice;

    move-result-object p0

    const-string p1, "getRemoteDevice(...)"

    invoke-static {p0, p1}, Lkotlin/jvm/internal/Intrinsics;->o(Ljava/lang/Object;Ljava/lang/String;)V

    return-object p0
.end method

.method public final w()Lbluconnect/za7;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->d:Lbluconnect/za7;

    if-eqz p0, :cond_0

    return-object p0

    :cond_0
    const-string p0, "deviceScanCallback"

    invoke-static {p0}, Lkotlin/jvm/internal/Intrinsics;->S(Ljava/lang/String;)V

    const/4 p0, 0x0

    throw p0
.end method

.method public x()Ljava/util/Queue;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Queue<",
            "[B>;"
        }
    .end annotation

    sget-object p0, Lbluconnect/o12;->s:Ljava/util/Queue;

    return-object p0
.end method

.method public final y()Lbluconnect/jxa;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->e:Lbluconnect/jxa;

    return-object p0
.end method

.method public final z()Lbluconnect/f42;
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    iget-object p0, p0, Lbluconnect/o12;->f:Lbluconnect/f42;

    return-object p0
.end method
