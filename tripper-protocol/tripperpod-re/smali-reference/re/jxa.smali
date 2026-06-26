.class public Lbluconnect/jxa;
.super Landroid/bluetooth/BluetoothGattCallback;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation


# static fields
.field public static b:Landroid/bluetooth/BluetoothGatt;

.field public static final c:Landroid/os/ParcelUuid;

.field public static final d:Ljava/util/UUID;

.field public static final e:Ljava/util/UUID;

.field public static final f:Ljava/util/UUID;

.field public static g:Landroid/bluetooth/BluetoothGattCharacteristic;

.field public static h:Landroid/bluetooth/BluetoothGatt;


# instance fields
.field public a:Lbluconnect/o12;


# direct methods
.method static constructor <clinit>()V
    .locals 2

    const-string v0, "01FF0100-BA5E-F4EE-5CA1-EB1E5E4B1CE0"

    invoke-static {v0}, Landroid/os/ParcelUuid;->fromString(Ljava/lang/String;)Landroid/os/ParcelUuid;

    move-result-object v1

    sput-object v1, Lbluconnect/jxa;->c:Landroid/os/ParcelUuid;

    invoke-static {v0}, Ljava/util/UUID;->fromString(Ljava/lang/String;)Ljava/util/UUID;

    move-result-object v0

    sput-object v0, Lbluconnect/jxa;->d:Ljava/util/UUID;

    const-string v0, "01FF0101-BA5E-F4EE-5CA1-EB1E5E4B1CE0"

    invoke-static {v0}, Ljava/util/UUID;->fromString(Ljava/lang/String;)Ljava/util/UUID;

    move-result-object v0

    sput-object v0, Lbluconnect/jxa;->e:Ljava/util/UUID;

    const-string v0, "00002901-0000-1000-8000-00805f9b34fb"

    invoke-static {v0}, Ljava/util/UUID;->fromString(Ljava/lang/String;)Ljava/util/UUID;

    move-result-object v0

    sput-object v0, Lbluconnect/jxa;->f:Ljava/util/UUID;

    return-void
.end method

.method public constructor <init>(Lbluconnect/o12;)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "bleManager"
        }
    .end annotation

    invoke-direct {p0}, Landroid/bluetooth/BluetoothGattCallback;-><init>()V

    iput-object p1, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    return-void
.end method


# virtual methods
.method public onCharacteristicChanged(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;)V
    .locals 1
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0
        }
        names = {
            "gatt",
            "characteristic"
        }
    .end annotation

    invoke-super {p0, p1, p2}, Landroid/bluetooth/BluetoothGattCallback;->onCharacteristicChanged(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;)V

    invoke-virtual {p2}, Landroid/bluetooth/BluetoothGattCharacteristic;->getValue()[B

    move-result-object p1

    const-string p2, "GattCallback"

    const-string v0, "onCharacteristicWriteRequest"

    invoke-static {p2, v0}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    iget-object p0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    invoke-virtual {p0, p1}, Lbluconnect/o12;->l([B)V

    return-void
.end method

.method public onCharacteristicRead(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;I)V
    .locals 0
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0,
            0x0
        }
        names = {
            "gatt",
            "characteristic",
            "status"
        }
    .end annotation

    return-void
.end method

.method public onCharacteristicWrite(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;I)V
    .locals 2
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0,
            0x0
        }
        names = {
            "gatt",
            "characteristic",
            "status"
        }
    .end annotation

    invoke-super {p0, p1, p2, p3}, Landroid/bluetooth/BluetoothGattCallback;->onCharacteristicWrite(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;I)V

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "onCharacteristicWrite :"

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p2}, Landroid/bluetooth/BluetoothGattCharacteristic;->getValue()[B

    move-result-object v1

    invoke-static {v1}, Ljava/util/Arrays;->toString([B)Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "GattCallback"

    invoke-static {v1, v0}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    iget-object v0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    invoke-virtual {v0, p1, p2, p3}, Lbluconnect/o12;->K(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;I)V

    invoke-virtual {p2}, Landroid/bluetooth/BluetoothGattCharacteristic;->getValue()[B

    move-result-object p1

    if-eqz p1, :cond_0

    const/4 p2, 0x0

    aget-byte p2, p1, p2

    const/16 p3, 0x21

    if-ne p2, p3, :cond_0

    const/4 p2, 0x1

    aget-byte p2, p1, p2

    if-nez p2, :cond_0

    const/16 p2, 0x12

    aget-byte p2, p1, p2

    const/16 p3, 0x40

    if-ne p2, p3, :cond_0

    const/16 p2, 0x13

    aget-byte p1, p1, p2

    const/16 p2, 0x45

    if-ne p1, p2, :cond_0

    iget-object p0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    invoke-virtual {p0}, Lbluconnect/o12;->O()V

    :cond_0
    return-void
.end method

.method public onConnectionStateChange(Landroid/bluetooth/BluetoothGatt;II)V
    .locals 3
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0,
            0x0
        }
        names = {
            "gatt",
            "status",
            "newState"
        }
    .end annotation

    sput-object p1, Lbluconnect/jxa;->b:Landroid/bluetooth/BluetoothGatt;

    sput-object p1, Lbluconnect/jxa;->h:Landroid/bluetooth/BluetoothGatt;

    const-string v0, "onConnectionStateChange"

    const-string v1, "BLECONNECT"

    invoke-static {v1, v0}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v2, "onConnectionStateChange: status : "

    invoke-direct {v0, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, p2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v2, " newState  "

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p3}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v2, "GattCallback"

    invoke-static {v2, v0}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    const/4 v0, 0x2

    if-ne p3, v0, :cond_0

    const-string v0, "onConnectionStateChange connect"

    invoke-static {v0, p3, v1}, Lbluconnect/xdf;->a(Ljava/lang/String;ILjava/lang/String;)V

    iget-object p0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    invoke-virtual {p0, p1, p2, p3}, Lbluconnect/o12;->L(Landroid/bluetooth/BluetoothGatt;II)V

    return-void

    :cond_0
    if-nez p3, :cond_1

    const-string v0, "onConnectionStateChange disconnect"

    invoke-static {v0, p3, v1}, Lbluconnect/xdf;->a(Ljava/lang/String;ILjava/lang/String;)V

    sget-object v0, Lbluconnect/jxa;->b:Landroid/bluetooth/BluetoothGatt;

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothGatt;->disconnect()V

    sget-object v0, Lbluconnect/jxa;->b:Landroid/bluetooth/BluetoothGatt;

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothGatt;->close()V

    iget-object v0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Lbluconnect/o12;->a(Z)V

    iget-object v0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    invoke-virtual {v0, v1, v1, v1}, Lbluconnect/o12;->i(ZII)V

    iget-object p0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    invoke-virtual {p0, p1, p2, p3}, Lbluconnect/o12;->L(Landroid/bluetooth/BluetoothGatt;II)V

    :cond_1
    return-void
.end method

.method public onServicesDiscovered(Landroid/bluetooth/BluetoothGatt;I)V
    .locals 6
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0
        }
        names = {
            "gatt",
            "status"
        }
    .end annotation

    const-string v0, "GattCallback"

    const-string v1, "onServicesDiscovered: status : "

    invoke-static {v1, p2, v0}, Lbluconnect/xdf;->a(Ljava/lang/String;ILjava/lang/String;)V

    if-nez p2, :cond_2

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothGatt;->getServices()Ljava/util/List;

    move-result-object p1

    invoke-interface {p1}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object p1

    :cond_0
    invoke-interface {p1}, Ljava/util/Iterator;->hasNext()Z

    move-result p2

    if-eqz p2, :cond_2

    invoke-interface {p1}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object p2

    check-cast p2, Landroid/bluetooth/BluetoothGattService;

    invoke-virtual {p2}, Landroid/bluetooth/BluetoothGattService;->getUuid()Ljava/util/UUID;

    move-result-object v0

    invoke-virtual {v0}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object v0

    sget-object v1, Lbluconnect/jxa;->c:Landroid/os/ParcelUuid;

    invoke-virtual {v1}, Landroid/os/ParcelUuid;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-virtual {p2}, Landroid/bluetooth/BluetoothGattService;->getCharacteristics()Ljava/util/List;

    move-result-object p2

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "gattCharacteristics :"

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-interface {p2}, Ljava/util/List;->size()I

    move-result v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "onserviceDiscovered"

    invoke-static {v1, v0}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-interface {p2}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object p2

    :cond_1
    :goto_0
    invoke-interface {p2}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-interface {p2}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/bluetooth/BluetoothGattCharacteristic;

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "gattCharacteristic :"

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothGattCharacteristic;->getUuid()Ljava/util/UUID;

    move-result-object v2

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "charUuid :"

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {v2}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object v2

    sget-object v3, Lbluconnect/jxa;->e:Ljava/util/UUID;

    invoke-virtual {v3}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_1

    sget-object v2, Lbluconnect/jxa;->b:Landroid/bluetooth/BluetoothGatt;

    const/4 v3, 0x1

    invoke-virtual {v2, v0, v3}, Landroid/bluetooth/BluetoothGatt;->setCharacteristicNotification(Landroid/bluetooth/BluetoothGattCharacteristic;Z)Z

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "characteristicToWrite :"

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    sget-object v3, Lbluconnect/jxa;->g:Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    sput-object v0, Lbluconnect/jxa;->g:Landroid/bluetooth/BluetoothGattCharacteristic;

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "gattCharacteristicValue :"

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothGattCharacteristic;->getValue()[B

    move-result-object v3

    invoke-static {v3}, Ljava/util/Arrays;->toString([B)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "gattCharacteristicprop :"

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothGattCharacteristic;->getProperties()I

    move-result v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-static {v1, v2}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    sget-object v2, Lbluconnect/jxa;->f:Ljava/util/UUID;

    invoke-virtual {v0, v2}, Landroid/bluetooth/BluetoothGattCharacteristic;->getDescriptor(Ljava/util/UUID;)Landroid/bluetooth/BluetoothGattDescriptor;

    move-result-object v2

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "descriptor :"

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    invoke-static {}, Lbluconnect/dma;->n()Lbluconnect/dma;

    move-result-object v3

    sget-object v4, Lbluconnect/jxa;->b:Landroid/bluetooth/BluetoothGatt;

    sget-object v5, Lbluconnect/jxa;->g:Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {v3, v4, v5}, Lbluconnect/dma;->z(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattCharacteristic;)V

    if-eqz v2, :cond_1

    sget-object v3, Landroid/bluetooth/BluetoothGattDescriptor;->ENABLE_NOTIFICATION_VALUE:[B

    invoke-virtual {v2, v3}, Landroid/bluetooth/BluetoothGattDescriptor;->setValue([B)Z

    sget-object v3, Lbluconnect/jxa;->b:Landroid/bluetooth/BluetoothGatt;

    invoke-virtual {v3, v2}, Landroid/bluetooth/BluetoothGatt;->writeDescriptor(Landroid/bluetooth/BluetoothGattDescriptor;)Z

    sput-object v0, Lbluconnect/jxa;->g:Landroid/bluetooth/BluetoothGattCharacteristic;

    const-string v0, "Subscribed"

    invoke-static {v1, v0}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->e(Ljava/lang/String;Ljava/lang/String;)I

    goto/16 :goto_0

    :cond_2
    sget-object p1, Lbluconnect/jxa;->g:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz p1, :cond_3

    iget-object p0, p0, Lbluconnect/jxa;->a:Lbluconnect/o12;

    invoke-virtual {p0, p1}, Lbluconnect/o12;->J(Landroid/bluetooth/BluetoothGattCharacteristic;)V

    :cond_3
    return-void
.end method
