.method public onServicesDiscovered(Landroid/bluetooth/BluetoothGatt;I)V
    .locals 10

    const-string v0, "g"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    const-string v1, "onServicesDiscovered status="

    invoke-static {p2, v1}, Lcom/google/android/libraries/navigation/internal/xz/A;->h(ILjava/lang/String;)Ljava/lang/String;

    move-result-object v1

    sget-object v2, Lcom/supertripper/app/TripperBleManager$LogLevel;->INFO:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-static {v0, v1, v2}, Lcom/supertripper/app/TripperBleManager;->access$logMsg(Lcom/supertripper/app/TripperBleManager;Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    if-eqz p2, :cond_0

    iget-object p1, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    const-string p2, "Discovery falhou"

    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-static {p1, p2, v0}, Lcom/supertripper/app/TripperBleManager;->access$logMsg(Lcom/supertripper/app/TripperBleManager;Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    return-void

    :cond_0
    sget-object p2, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {p2}, Lcom/supertripper/app/TripperProtocol;->getSERVICE_UUID()Ljava/util/UUID;

    move-result-object v0

    invoke-virtual {v0}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "toString(...)"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-virtual {p2}, Lcom/supertripper/app/TripperProtocol;->getWRITE_CHAR_UUID()Ljava/util/UUID;

    move-result-object p2

    invoke-virtual {p2}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object p2

    invoke-static {p2, v1}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothGatt;->getServices()Ljava/util/List;

    move-result-object v2

    invoke-interface {v2}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object v2

    const/4 v3, 0x0

    :cond_1
    invoke-interface {v2}, Ljava/util/Iterator;->hasNext()Z

    move-result v4

    if-eqz v4, :cond_4

    invoke-interface {v2}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v4

    check-cast v4, Landroid/bluetooth/BluetoothGattService;

    iget-object v5, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    new-instance v6, Ljava/lang/StringBuilder;

    const-string v7, "  Svc: "

    invoke-direct {v6, v7}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v4}, Landroid/bluetooth/BluetoothGattService;->getUuid()Ljava/util/UUID;

    move-result-object v7

    invoke-virtual {v6, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {v6}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v6

    sget-object v7, Lcom/supertripper/app/TripperBleManager$LogLevel;->INFO:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-static {v5, v6, v7}, Lcom/supertripper/app/TripperBleManager;->access$logMsg(Lcom/supertripper/app/TripperBleManager;Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    invoke-virtual {v4}, Landroid/bluetooth/BluetoothGattService;->getUuid()Ljava/util/UUID;

    move-result-object v5

    invoke-virtual {v5}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object v5

    invoke-static {v5, v0}, Lc5/j;->y(Ljava/lang/String;Ljava/lang/String;)Z

    move-result v5

    if-eqz v5, :cond_1

    invoke-virtual {v4}, Landroid/bluetooth/BluetoothGattService;->getCharacteristics()Ljava/util/List;

    move-result-object v4

    invoke-interface {v4}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object v4

    :cond_2
    invoke-interface {v4}, Ljava/util/Iterator;->hasNext()Z

    move-result v5

    if-eqz v5, :cond_3

    invoke-interface {v4}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v5

    check-cast v5, Landroid/bluetooth/BluetoothGattCharacteristic;

    iget-object v6, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    new-instance v7, Ljava/lang/StringBuilder;

    const-string v8, "    Chr: "

    invoke-direct {v7, v8}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v5}, Landroid/bluetooth/BluetoothGattCharacteristic;->getUuid()Ljava/util/UUID;

    move-result-object v8

    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    const-string v8, " props=0x"

    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v5}, Landroid/bluetooth/BluetoothGattCharacteristic;->getProperties()I

    move-result v8

    const/16 v9, 0x10

    invoke-static {v9}, Lkotlin/text/a;->a(I)V

    invoke-static {v8, v9}, Ljava/lang/Integer;->toString(II)Ljava/lang/String;

    move-result-object v8

    invoke-static {v8, v1}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v7}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v7

    sget-object v8, Lcom/supertripper/app/TripperBleManager$LogLevel;->INFO:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-static {v6, v7, v8}, Lcom/supertripper/app/TripperBleManager;->access$logMsg(Lcom/supertripper/app/TripperBleManager;Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    invoke-virtual {v5}, Landroid/bluetooth/BluetoothGattCharacteristic;->getUuid()Ljava/util/UUID;

    move-result-object v6

    invoke-virtual {v6}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object v6

    invoke-static {v6, p2}, Lc5/j;->y(Ljava/lang/String;Ljava/lang/String;)Z

    move-result v6

    if-eqz v6, :cond_2

    move-object v3, v5

    :cond_3
    if-eqz v3, :cond_1

    :cond_4
    if-nez v3, :cond_5

    iget-object p1, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    const-string p2, "\u274c Chr Tripper nao encontrada"

    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-static {p1, p2, v0}, Lcom/supertripper/app/TripperBleManager;->access$logMsg(Lcom/supertripper/app/TripperBleManager;Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    return-void

    :cond_5
    iget-object p2, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    invoke-static {p2, v3}, Lcom/supertripper/app/TripperBleManager;->access$setWriteChar$p(Lcom/supertripper/app/TripperBleManager;Landroid/bluetooth/BluetoothGattCharacteristic;)V

    iget-object p2, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    const-string v0, "\u2713 Chr escrita OK"

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-static {p2, v0, v1}, Lcom/supertripper/app/TripperBleManager;->access$logMsg(Lcom/supertripper/app/TripperBleManager;Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    const/4 p2, 0x1

    invoke-virtual {p1, v3, p2}, Landroid/bluetooth/BluetoothGatt;->setCharacteristicNotification(Landroid/bluetooth/BluetoothGattCharacteristic;Z)Z

    sget-object p2, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {p2}, Lcom/supertripper/app/TripperProtocol;->getCCCD_UUID()Ljava/util/UUID;

    move-result-object p2

    invoke-virtual {v3, p2}, Landroid/bluetooth/BluetoothGattCharacteristic;->getDescriptor(Ljava/util/UUID;)Landroid/bluetooth/BluetoothGattDescriptor;

    move-result-object p2

    if-nez p2, :cond_6

    invoke-virtual {v3}, Landroid/bluetooth/BluetoothGattCharacteristic;->getDescriptors()Ljava/util/List;

    move-result-object p2

    const-string v0, "getDescriptors(...)"

    invoke-static {p2, v0}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-static {p2}, LY3/h;->b0(Ljava/util/List;)Ljava/lang/Object;

    move-result-object p2

    check-cast p2, Landroid/bluetooth/BluetoothGattDescriptor;

    :cond_6
    if-eqz p2, :cond_7

    sget-object v0, Landroid/bluetooth/BluetoothGattDescriptor;->ENABLE_NOTIFICATION_VALUE:[B

    invoke-virtual {p2, v0}, Landroid/bluetooth/BluetoothGattDescriptor;->setValue([B)Z

    invoke-virtual {p1, p2}, Landroid/bluetooth/BluetoothGatt;->writeDescriptor(Landroid/bluetooth/BluetoothGattDescriptor;)Z

    :cond_7
    iget-object p1, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    invoke-static {p1}, Lcom/supertripper/app/TripperBleManager;->access$getHandler$p(Lcom/supertripper/app/TripperBleManager;)Landroid/os/Handler;

    move-result-object p1

    iget-object p2, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    new-instance v0, Lcom/supertripper/app/w;

    const/4 v1, 0x7

    invoke-direct {v0, p2, v1}, Lcom/supertripper/app/w;-><init>(Lcom/supertripper/app/TripperBleManager;I)V

    const-wide/16 v1, 0xc8

    invoke-virtual {p1, v0, v1, v2}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    return-void
.end method
