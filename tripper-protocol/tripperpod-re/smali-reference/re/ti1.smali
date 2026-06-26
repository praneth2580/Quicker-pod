.class public Lbluconnect/ti1;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation


# static fields
.field public static g:Lbluconnect/ti1;


# instance fields
.field public a:Landroid/bluetooth/BluetoothGatt;

.field public b:Landroid/bluetooth/BluetoothGattServer;

.field public c:Ljava/util/List;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;"
        }
    .end annotation
.end field

.field public d:Z

.field public e:Z

.field public f:Z


# direct methods
.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 v0, 0x0

    iput-boolean v0, p0, Lbluconnect/ti1;->d:Z

    iput-boolean v0, p0, Lbluconnect/ti1;->e:Z

    return-void
.end method

.method public static d()Lbluconnect/ti1;
    .locals 1

    sget-object v0, Lbluconnect/ti1;->g:Lbluconnect/ti1;

    if-nez v0, :cond_0

    new-instance v0, Lbluconnect/ti1;

    invoke-direct {v0}, Lbluconnect/ti1;-><init>()V

    sput-object v0, Lbluconnect/ti1;->g:Lbluconnect/ti1;

    :cond_0
    sget-object v0, Lbluconnect/ti1;->g:Lbluconnect/ti1;

    return-object v0
.end method


# virtual methods
.method public a()Landroid/bluetooth/BluetoothGatt;
    .locals 0

    iget-object p0, p0, Lbluconnect/ti1;->a:Landroid/bluetooth/BluetoothGatt;

    return-object p0
.end method

.method public b()Landroid/bluetooth/BluetoothGattServer;
    .locals 0

    iget-object p0, p0, Lbluconnect/ti1;->b:Landroid/bluetooth/BluetoothGattServer;

    return-object p0
.end method

.method public c()Ljava/util/List;
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;"
        }
    .end annotation

    iget-object p0, p0, Lbluconnect/ti1;->c:Ljava/util/List;

    return-object p0
.end method

.method public e()Z
    .locals 0

    iget-boolean p0, p0, Lbluconnect/ti1;->f:Z

    return p0
.end method

.method public f()Z
    .locals 0

    iget-boolean p0, p0, Lbluconnect/ti1;->e:Z

    return p0
.end method

.method public g()Z
    .locals 0

    iget-boolean p0, p0, Lbluconnect/ti1;->d:Z

    return p0
.end method

.method public h(Landroid/bluetooth/BluetoothGatt;)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "bluetoothGatt"
        }
    .end annotation

    iput-object p1, p0, Lbluconnect/ti1;->a:Landroid/bluetooth/BluetoothGatt;

    return-void
.end method

.method public i(Landroid/bluetooth/BluetoothGattServer;)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "bluetoothGattServer"
        }
    .end annotation

    iput-object p1, p0, Lbluconnect/ti1;->b:Landroid/bluetooth/BluetoothGattServer;

    return-void
.end method

.method public j(Ljava/util/List;)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "connectedDeviceInfo"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;)V"
        }
    .end annotation

    iput-object p1, p0, Lbluconnect/ti1;->c:Ljava/util/List;

    return-void
.end method

.method public k(Z)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "deviceConnected"
        }
    .end annotation

    iput-boolean p1, p0, Lbluconnect/ti1;->f:Z

    return-void
.end method

.method public l(Z)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "manualDisconnect"
        }
    .end annotation

    iput-boolean p1, p0, Lbluconnect/ti1;->e:Z

    return-void
.end method

.method public m(Z)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "scanning"
        }
    .end annotation

    iput-boolean p1, p0, Lbluconnect/ti1;->d:Z

    return-void
.end method
