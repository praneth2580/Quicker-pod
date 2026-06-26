.method private final handleNotification([B)V
    .locals 8

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onNotification:Lkotlin/jvm/functions/Function1;

    if-eqz v0, :cond_0

    invoke-interface {v0, p1}, Lkotlin/jvm/functions/Function1;->invoke(Ljava/lang/Object;)Ljava/lang/Object;

    :cond_0
    sget-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v0, p1}, Lcom/supertripper/app/TripperProtocol;->parseResponse([B)Lcom/supertripper/app/TripperProtocol$TripperResponse;

    move-result-object p1

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getLabel()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/String;->hashCode()I

    move-result v1

    const/4 v2, 0x0

    const-string v3, "SERIAL"

    const-string v4, "\u2713"

    const-string v5, "OS_VERSION"

    const-string v6, "AUTH"

    sparse-switch v1, :sswitch_data_0

    goto :goto_0

    :sswitch_0
    invoke-virtual {v0, v5}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_4

    goto :goto_0

    :sswitch_1
    const-string v1, "NACK"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_1

    goto :goto_0

    :cond_1
    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    goto :goto_1

    :sswitch_2
    invoke-virtual {v0, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_2

    goto :goto_0

    :cond_2
    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getDescription()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0, v4, v2}, Lc5/j;->E(Ljava/lang/String;Ljava/lang/String;Z)Z

    move-result v0

    if-eqz v0, :cond_3

    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    goto :goto_1

    :cond_3
    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    goto :goto_1

    :sswitch_3
    const-string v1, "TIME_ACK"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_4

    goto :goto_0

    :sswitch_4
    const-string v1, "SESSION"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_4

    goto :goto_0

    :sswitch_5
    const-string v1, "NAV_ACK"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_4

    goto :goto_0

    :sswitch_6
    invoke-virtual {v0, v3}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_4

    :goto_0
    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->INFO:Lcom/supertripper/app/TripperBleManager$LogLevel;

    goto :goto_1

    :cond_4
    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    :goto_1
    new-instance v1, Ljava/lang/StringBuilder;

    const-string v7, "  \u25b6 ["

    invoke-direct {v1, v7}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getLabel()Ljava/lang/String;

    move-result-object v7

    invoke-virtual {v1, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v7, "] "

    invoke-virtual {v1, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getDescription()Ljava/lang/String;

    move-result-object v7

    invoke-virtual {v1, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-direct {p0, v1, v0}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getLabel()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0, v6}, Lkotlin/jvm/internal/Intrinsics;->b(Ljava/lang/Object;Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_5

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getDescription()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0, v4, v2}, Lc5/j;->E(Ljava/lang/String;Ljava/lang/String;Z)Z

    move-result v0

    if-eqz v0, :cond_5

    iget-object p1, p0, Lcom/supertripper/app/TripperBleManager;->onPinAccepted:Lkotlin/jvm/functions/Function0;

    if-eqz p1, :cond_a

    invoke-interface {p1}, Lkotlin/jvm/functions/Function0;->invoke()Ljava/lang/Object;

    goto/16 :goto_2

    :cond_5
    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getLabel()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0, v6}, Lkotlin/jvm/internal/Intrinsics;->b(Ljava/lang/Object;Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_6

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getDescription()Ljava/lang/String;

    move-result-object v0

    const-string v1, "\u2717"

    invoke-static {v0, v1, v2}, Lc5/j;->E(Ljava/lang/String;Ljava/lang/String;Z)Z

    move-result v0

    if-eqz v0, :cond_6

    iget-object p1, p0, Lcom/supertripper/app/TripperBleManager;->onPinRejected:Lkotlin/jvm/functions/Function0;

    if-eqz p1, :cond_a

    invoke-interface {p1}, Lkotlin/jvm/functions/Function0;->invoke()Ljava/lang/Object;

    goto/16 :goto_2

    :cond_6
    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getLabel()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0, v5}, Lkotlin/jvm/internal/Intrinsics;->b(Ljava/lang/Object;Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_9

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getDescription()Ljava/lang/String;

    move-result-object p1

    const-string v0, "Firmware: "

    invoke-static {p1, v0}, Lc5/l;->Z(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    new-instance v0, Lkotlin/text/Regex;

    const-string v1, "\\((\\d+\\.\\d+)\\)"

    invoke-direct {v0, v1}, Lkotlin/text/Regex;-><init>(Ljava/lang/String;)V

    invoke-static {v0, p1}, Lkotlin/text/Regex;->a(Lkotlin/text/Regex;Ljava/lang/String;)Lkotlin/text/b;

    move-result-object v0

    if-eqz v0, :cond_7

    invoke-virtual {v0}, Lkotlin/text/b;->a()Ljava/util/List;

    move-result-object v0

    const/4 v1, 0x1

    check-cast v0, Lkotlin/text/MatcherMatchResult$groupValues$1;

    invoke-virtual {v0, v1}, Lkotlin/text/MatcherMatchResult$groupValues$1;->get(I)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Ljava/lang/String;

    if-nez v0, :cond_8

    :cond_7
    move-object v0, p1

    :cond_8
    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->getTripperPrefs()Landroid/content/SharedPreferences;

    move-result-object v1

    invoke-interface {v1}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    const-string v2, "lastTripperFirmware"

    invoke-interface {v1, v2, v0}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    invoke-interface {v1}, Landroid/content/SharedPreferences$Editor;->apply()V

    const-string v1, "\u2605 Firmware salvo: "

    invoke-virtual {v1, v0}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onTripperInfo:Lkotlin/jvm/functions/Function2;

    if-eqz v0, :cond_a

    const-string v1, "Firmware"

    invoke-interface {v0, v1, p1}, Lkotlin/jvm/functions/Function2;->invoke(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    goto :goto_2

    :cond_9
    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getLabel()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0, v3}, Lkotlin/jvm/internal/Intrinsics;->b(Ljava/lang/Object;Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_a

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onTripperInfo:Lkotlin/jvm/functions/Function2;

    if-eqz v0, :cond_a

    invoke-virtual {p1}, Lcom/supertripper/app/TripperProtocol$TripperResponse;->getDescription()Ljava/lang/String;

    move-result-object p1

    const-string v1, "Serial: \""

    invoke-static {p1, v1}, Lc5/l;->Z(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    const-string v1, "\""

    invoke-static {p1, v1}, Lc5/l;->T(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    const-string v1, "Serial"

    invoke-interface {v0, v1, p1}, Lkotlin/jvm/functions/Function2;->invoke(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    :cond_a
    :goto_2
    return-void

    :sswitch_data_0
    .sparse-switch
        -0x6e6b0e0c -> :sswitch_6
        -0x6e06e0d3 -> :sswitch_5
        -0x5ee3f18a -> :sswitch_4
        -0x4d18b809 -> :sswitch_3
        0x1ed5a8 -> :sswitch_2
        0x24715b -> :sswitch_1
        0x412a355d -> :sswitch_0
    .end sparse-switch
.end method

.method private final logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V
    .locals 2

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "["

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    const-string v1, "] "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    const-string v1, "TripperBle"

    invoke-static {v1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onLog:Lkotlin/jvm/functions/Function2;

    if-eqz v0, :cond_0

    invoke-interface {v0, p1, p2}, Lkotlin/jvm/functions/Function2;->invoke(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    :cond_0
    return-void
.end method

.method private final pumpQueue()V
    .locals 7

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->writePending:Ljava/util/concurrent/atomic/AtomicBoolean;

    invoke-virtual {v0}, Ljava/util/concurrent/atomic/AtomicBoolean;->get()Z

    move-result v0

    if-eqz v0, :cond_0

    return-void

    :cond_0
    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->writeChar:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-nez v0, :cond_1

    return-void

    :cond_1
    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->sendQueue:Ljava/util/concurrent/ConcurrentLinkedQueue;

    invoke-virtual {v1}, Ljava/util/concurrent/ConcurrentLinkedQueue;->poll()Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lkotlin/Pair;

    if-nez v1, :cond_2

    return-void

    :cond_2
    iget-object v2, p0, Lcom/supertripper/app/TripperBleManager;->writePending:Ljava/util/concurrent/atomic/AtomicBoolean;

    const/4 v3, 0x0

    const/4 v4, 0x1

    invoke-virtual {v2, v3, v4}, Ljava/util/concurrent/atomic/AtomicBoolean;->compareAndSet(ZZ)Z

    move-result v2

    if-nez v2, :cond_3

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->sendQueue:Ljava/util/concurrent/ConcurrentLinkedQueue;

    invoke-virtual {v0, v1}, Ljava/util/concurrent/ConcurrentLinkedQueue;->offer(Ljava/lang/Object;)Z

    return-void

    :cond_3
    iget-object v2, v1, Lkotlin/Pair;->b:Ljava/lang/Object;

    check-cast v2, [B

    iget-object v1, v1, Lkotlin/Pair;->g0:Ljava/lang/Object;

    check-cast v1, Ljava/lang/String;

    const-string v5, "\u2192 "

    const-string v6, "  "

    invoke-static {v5, v1, v6}, Lcom/google/android/libraries/navigation/internal/xz/A;->k(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    sget-object v5, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v5, v2}, Lcom/supertripper/app/TripperProtocol;->toHex([B)Ljava/lang/String;

    move-result-object v5

    invoke-virtual {v1, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    sget-object v5, Lcom/supertripper/app/TripperBleManager$LogLevel;->SEND:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v1, v5}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    invoke-virtual {v0, v4}, Landroid/bluetooth/BluetoothGattCharacteristic;->setWriteType(I)V

    invoke-virtual {v0, v2}, Landroid/bluetooth/BluetoothGattCharacteristic;->setValue([B)Z

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->gatt:Landroid/bluetooth/BluetoothGatt;

    if-eqz v1, :cond_4

    invoke-virtual {v1, v0}, Landroid/bluetooth/BluetoothGatt;->writeCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    move-result v0

    goto :goto_0

    :cond_4
    move v0, v3

    :goto_0
    if-nez v0, :cond_5

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->writePending:Ljava/util/concurrent/atomic/AtomicBoolean;

    invoke-virtual {v0, v3}, Ljava/util/concurrent/atomic/AtomicBoolean;->set(Z)V

    const-string v0, "writeChar FALHOU"

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    goto :goto_1

    :cond_5
    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    new-instance v1, Lcom/supertripper/app/w;

    const/4 v2, 0x4

    invoke-direct {v1, p0, v2}, Lcom/supertripper/app/w;-><init>(Lcom/supertripper/app/TripperBleManager;I)V

    const-wide/16 v2, 0x50

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    :goto_1
    return-void
.end method

.method private static final pumpQueue$lambda$9(Lcom/supertripper/app/TripperBleManager;)V
    .locals 2

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->writePending:Ljava/util/concurrent/atomic/AtomicBoolean;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Ljava/util/concurrent/atomic/AtomicBoolean;->set(Z)V

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->pumpQueue()V

    return-void
.end method

.method private final rawWrite([BLjava/lang/String;)V
    .locals 3

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->writeChar:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-nez v0, :cond_0

    return-void

    :cond_0
    const-string v1, "\u2192 "

    const-string v2, "  "

    invoke-static {v1, p2, v2}, Lcom/google/android/libraries/navigation/internal/xz/A;->k(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p2

    sget-object v1, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v1, p1}, Lcom/supertripper/app/TripperProtocol;->toHex([B)Ljava/lang/String;

    move-result-object v1

    invoke-virtual {p2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p2

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->SEND:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, p2, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    const/4 p2, 0x1

    invoke-virtual {v0, p2}, Landroid/bluetooth/BluetoothGattCharacteristic;->setWriteType(I)V

    invoke-virtual {v0, p1}, Landroid/bluetooth/BluetoothGattCharacteristic;->setValue([B)Z

    iget-object p1, p0, Lcom/supertripper/app/TripperBleManager;->gatt:Landroid/bluetooth/BluetoothGatt;

    if-eqz p1, :cond_1

    invoke-virtual {p1, v0}, Landroid/bluetooth/BluetoothGatt;->writeCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    :cond_1
    return-void
.end method

.method private static final reconnectRunnable$lambda$0(Lcom/supertripper/app/TripperBleManager;)V
    .locals 6

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    iget-wide v0, p0, Lcom/supertripper/app/TripperBleManager;->startupReconnectDeadline:J

    const-wide/16 v2, 0x0

    cmp-long v0, v0, v2

    if-lez v0, :cond_0

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v0

    iget-wide v4, p0, Lcom/supertripper/app/TripperBleManager;->startupReconnectDeadline:J

    cmp-long v0, v0, v4

    if-lez v0, :cond_0

    iput-wide v2, p0, Lcom/supertripper/app/TripperBleManager;->startupReconnectDeadline:J

    const-string v0, "Auto-reconex\u00e3o startup: prazo expirado, desistindo"

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->WARN:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    return-void

    :cond_0
    iget-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->userDisconnected:Z

    if-eqz v0, :cond_1

    return-void

    :cond_1
    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->currentDeviceMac:Ljava/lang/String;

    if-nez v0, :cond_2

    return-void

    :cond_2
    iget v1, p0, Lcom/supertripper/app/TripperBleManager;->reconnectAttempts:I

    add-int/lit8 v1, v1, 0x1

    iput v1, p0, Lcom/supertripper/app/TripperBleManager;->reconnectAttempts:I

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "Auto-reconex\u00e3o tentativa "

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget v2, p0, Lcom/supertripper/app/TripperBleManager;->reconnectAttempts:I

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v2, " para "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const/16 v2, 0x2026

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(C)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    sget-object v2, Lcom/supertripper/app/TripperBleManager$LogLevel;->INFO:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v1, v2}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    :try_start_0
    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->context:Landroid/content/Context;

    const-string v2, "bluetooth"

    invoke-virtual {v1, v2}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v1

    const-string v2, "null cannot be cast to non-null type android.bluetooth.BluetoothManager"

    invoke-static {v1, v2}, Lkotlin/jvm/internal/Intrinsics;->d(Ljava/lang/Object;Ljava/lang/String;)V

    check-cast v1, Landroid/bluetooth/BluetoothManager;

    invoke-virtual {v1}, Landroid/bluetooth/BluetoothManager;->getAdapter()Landroid/bluetooth/BluetoothAdapter;

    move-result-object v1

    invoke-virtual {v1, v0}, Landroid/bluetooth/BluetoothAdapter;->getRemoteDevice(Ljava/lang/String;)Landroid/bluetooth/BluetoothDevice;

    move-result-object v0

    const-string v1, "getRemoteDevice(...)"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-virtual {p0, v0}, Lcom/supertripper/app/TripperBleManager;->connectDevice(Landroid/bluetooth/BluetoothDevice;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "Auto-reconex\u00e3o erro: "

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->scheduleReconnect()V

    :goto_0
    return-void
.end method

.method private final scheduleReconnect()V
    .locals 4

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->reconnectRunnable:Ljava/lang/Runnable;

    invoke-virtual {v0, v1}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->reconnectRunnable:Ljava/lang/Runnable;

    const-wide/16 v2, 0x1388

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    return-void
.end method

.method public static synthetic sendNav$default(Lcom/supertripper/app/TripperBleManager;BIBBBBBILjava/lang/Object;)V
    .locals 10

    and-int/lit8 v0, p8, 0x8

    const/16 v1, 0x40

    if-eqz v0, :cond_0

    move v6, v1

    goto :goto_0

    :cond_0
    move v6, p4

    :goto_0
    and-int/lit8 v0, p8, 0x10

    if-eqz v0, :cond_1

    const/16 v0, 0x15

    move v7, v0

    goto :goto_1

    :cond_1
    move v7, p5

    :goto_1
    and-int/lit8 v0, p8, 0x20

    if-eqz v0, :cond_2

    const/16 v0, 0x41

    move v8, v0

    goto :goto_2

    :cond_2
    move/from16 v8, p6

    :goto_2
    and-int/lit8 v0, p8, 0x40

    if-eqz v0, :cond_3

    const/4 v0, 0x0

    move v9, v0

    goto :goto_3

    :cond_3
    move/from16 v9, p7

    :goto_3
    move-object v2, p0

    move v3, p1

    move v4, p2

    move v5, p3

    invoke-virtual/range {v2 .. v9}, Lcom/supertripper/app/TripperBleManager;->sendNav(BIBBBBB)V

    return-void
.end method

.method private final startGattServer()V
    .locals 7

    const-string v0, "GATT Server: "

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->gattServer:Landroid/bluetooth/BluetoothGattServer;

    if-eqz v1, :cond_0

    return-void

    :cond_0
    :try_start_0
    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->context:Landroid/content/Context;

    const-string v2, "bluetooth"

    invoke-virtual {v1, v2}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v1

    const-string v2, "null cannot be cast to non-null type android.bluetooth.BluetoothManager"

    invoke-static {v1, v2}, Lkotlin/jvm/internal/Intrinsics;->d(Ljava/lang/Object;Ljava/lang/String;)V

    check-cast v1, Landroid/bluetooth/BluetoothManager;

    iget-object v2, p0, Lcom/supertripper/app/TripperBleManager;->context:Landroid/content/Context;

    iget-object v3, p0, Lcom/supertripper/app/TripperBleManager;->serverCallback:Lcom/supertripper/app/TripperBleManager$serverCallback$1;

    invoke-virtual {v1, v2, v3}, Landroid/bluetooth/BluetoothManager;->openGattServer(Landroid/content/Context;Landroid/bluetooth/BluetoothGattServerCallback;)Landroid/bluetooth/BluetoothGattServer;

    move-result-object v1

    if-nez v1, :cond_1

    const-string v0, "openGattServer null"

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    return-void

    :catch_0
    move-exception v0

    goto :goto_2

    :cond_1
    iput-object v1, p0, Lcom/supertripper/app/TripperBleManager;->gattServer:Landroid/bluetooth/BluetoothGattServer;

    new-instance v2, Landroid/bluetooth/BluetoothGattService;

    sget-object v3, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v3}, Lcom/supertripper/app/TripperProtocol;->getSERVICE_UUID()Ljava/util/UUID;

    move-result-object v4

    const/4 v5, 0x0

    invoke-direct {v2, v4, v5}, Landroid/bluetooth/BluetoothGattService;-><init>(Ljava/util/UUID;I)V

    new-instance v4, Landroid/bluetooth/BluetoothGattCharacteristic;

    invoke-virtual {v3}, Lcom/supertripper/app/TripperProtocol;->getWRITE_CHAR_UUID()Ljava/util/UUID;

    move-result-object v3

    const/16 v5, 0xc

    const/16 v6, 0x10

    invoke-direct {v4, v3, v5, v6}, Landroid/bluetooth/BluetoothGattCharacteristic;-><init>(Ljava/util/UUID;II)V

    invoke-virtual {v2, v4}, Landroid/bluetooth/BluetoothGattService;->addCharacteristic(Landroid/bluetooth/BluetoothGattCharacteristic;)Z

    invoke-virtual {v1, v2}, Landroid/bluetooth/BluetoothGattServer;->addService(Landroid/bluetooth/BluetoothGattService;)Z

    move-result v1

    if-eqz v1, :cond_2

    const-string v2, "\u2713 OK"

    goto :goto_0

    :cond_2
    const-string v2, "\u274c erro"

    :goto_0
    invoke-virtual {v0, v2}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    if-eqz v1, :cond_3

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    goto :goto_1

    :cond_3
    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    :goto_1
    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_3

    :goto_2
    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "GATT Server erro: "

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->ERROR:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    :goto_3
    return-void
.end method

.method private final startHandshake()V
    .locals 4

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->currentDeviceMac:Ljava/lang/String;

    if-nez v0, :cond_0

    const-string v0, ""

    :cond_0
    invoke-virtual {p0, v0}, Lcom/supertripper/app/TripperBleManager;->isDeviceKnown(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_1

    const-string v0, "RECONEXAO: 0x21 00 + SET TIME + PING FW"

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v0}, Lcom/supertripper/app/TripperProtocol;->getPKT_CLOSE()[B

    move-result-object v0

    const-string v1, "CLOSE/RESUME"

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->enqueuePacket([BLjava/lang/String;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    new-instance v1, Lcom/supertripper/app/w;

    const/4 v2, 0x1

    invoke-direct {v1, p0, v2}, Lcom/supertripper/app/w;-><init>(Lcom/supertripper/app/TripperBleManager;I)V

    const-wide/16 v2, 0xc8

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    goto :goto_0

    :cond_1
    const-string v0, "NOVO DEVICE: SHOW PIN (0x21 01)"

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v0}, Lcom/supertripper/app/TripperProtocol;->getPKT_PIN_SHOW()[B

    move-result-object v0

    const-string v1, "SHOW PIN"

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->enqueuePacket([BLjava/lang/String;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    new-instance v1, Lcom/supertripper/app/w;

    const/4 v2, 0x2

    invoke-direct {v1, p0, v2}, Lcom/supertripper/app/w;-><init>(Lcom/supertripper/app/TripperBleManager;I)V

    const-wide/16 v2, 0x12c

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    :goto_0
    return-void
.end method

.method private static final startHandshake$lambda$12(Lcom/supertripper/app/TripperBleManager;)V
    .locals 4

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v0}, Lcom/supertripper/app/TripperProtocol;->buildSetTimeNowPacket()[B

    move-result-object v0

    const-string v1, "SET TIME"

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->enqueuePacket([BLjava/lang/String;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    new-instance v1, Lcom/supertripper/app/w;

    const/4 v2, 0x5

    invoke-direct {v1, p0, v2}, Lcom/supertripper/app/w;-><init>(Lcom/supertripper/app/TripperBleManager;I)V

    const-wide/16 v2, 0x96

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    return-void
.end method

.method private static final startHandshake$lambda$12$lambda$11(Lcom/supertripper/app/TripperBleManager;)V
    .locals 4

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v0}, Lcom/supertripper/app/TripperProtocol;->getPKT_PING_FW()[B

    move-result-object v1

    const-string v2, "PING FW (0x03)"

    invoke-direct {p0, v1, v2}, Lcom/supertripper/app/TripperBleManager;->enqueuePacket([BLjava/lang/String;)V

    invoke-virtual {v0}, Lcom/supertripper/app/TripperProtocol;->getPKT_PING_FW()[B

    move-result-object v0

    invoke-direct {p0, v0, v2}, Lcom/supertripper/app/TripperBleManager;->enqueuePacket([BLjava/lang/String;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    new-instance v1, Lcom/supertripper/app/w;

    const/4 v2, 0x0

    invoke-direct {v1, p0, v2}, Lcom/supertripper/app/w;-><init>(Lcom/supertripper/app/TripperBleManager;I)V

    const-wide/16 v2, 0x12c

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    return-void
.end method

.method private static final startHandshake$lambda$12$lambda$11$lambda$10(Lcom/supertripper/app/TripperBleManager;)V
    .locals 1

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object p0, p0, Lcom/supertripper/app/TripperBleManager;->onAlreadyPaired:Lkotlin/jvm/functions/Function0;

    if-eqz p0, :cond_0

    invoke-interface {p0}, Lkotlin/jvm/functions/Function0;->invoke()Ljava/lang/Object;

    :cond_0
    return-void
.end method

.method private static final startHandshake$lambda$13(Lcom/supertripper/app/TripperBleManager;)V
    .locals 1

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object p0, p0, Lcom/supertripper/app/TripperBleManager;->onReadyForPin:Lkotlin/jvm/functions/Function0;

    if-eqz p0, :cond_0

    invoke-interface {p0}, Lkotlin/jvm/functions/Function0;->invoke()Ljava/lang/Object;

    :cond_0
    return-void
.end method

.method private final stopGattServer()V
    .locals 1

    :try_start_0
    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->gattServer:Landroid/bluetooth/BluetoothGattServer;

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Landroid/bluetooth/BluetoothGattServer;->close()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    :catch_0
    :cond_0
    const/4 v0, 0x0

    iput-object v0, p0, Lcom/supertripper/app/TripperBleManager;->gattServer:Landroid/bluetooth/BluetoothGattServer;

    return-void
.end method


# virtual methods
.method public final connectDevice(Landroid/bluetooth/BluetoothDevice;)V
    .locals 4

    const-string v0, "device"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->userDisconnected:Z

    iput-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->hadConnection:Z

    sget-object v0, Lcom/supertripper/app/TripperService;->Companion:Lcom/supertripper/app/TripperService$Companion;

    invoke-virtual {v0}, Lcom/supertripper/app/TripperService$Companion;->getInstance()Lcom/supertripper/app/TripperService;

    move-result-object v0

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Lcom/supertripper/app/TripperService;->cancelAutoShutdown()V

    :cond_0
    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->reconnectRunnable:Ljava/lang/Runnable;

    invoke-virtual {v0, v1}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "Conectando "

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothDevice;->getAddress()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v1, "..."

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    sget-object v1, Lcom/supertripper/app/TripperBleManager$LogLevel;->INFO:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    invoke-virtual {p1}, Landroid/bluetooth/BluetoothDevice;->getAddress()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lcom/supertripper/app/TripperBleManager;->currentDeviceMac:Ljava/lang/String;

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v0}, Lcom/supertripper/app/TripperProtocol;->getPKT_NAV_IDLE()[B

    move-result-object v0

    iput-object v0, p0, Lcom/supertripper/app/TripperBleManager;->lastNavPacket:[B

    const-string v0, "NAV IDLE"

    iput-object v0, p0, Lcom/supertripper/app/TripperBleManager;->lastNavLabel:Ljava/lang/String;

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->cleanup()V

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->startGattServer()V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    new-instance v1, Lcom/supertripper/app/j;

    const/4 v2, 0x1

    invoke-direct {v1, p0, p1, v2}, Lcom/supertripper/app/j;-><init>(Ljava/lang/Object;Landroid/bluetooth/BluetoothDevice;I)V

    const-wide/16 v2, 0xc8

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    return-void
.end method

.method public final disconnectDevice()V
    .locals 4

    const/4 v0, 0x1

    iput-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->userDisconnected:Z

    const/4 v0, 0x0

    iput-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->hadConnection:Z

    iput v0, p0, Lcom/supertripper/app/TripperBleManager;->reconnectAttempts:I

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    iget-object v2, p0, Lcom/supertripper/app/TripperBleManager;->reconnectRunnable:Ljava/lang/Runnable;

    invoke-virtual {v1, v2}, Landroid/os/Handler;->removeCallbacks(Ljava/lang/Runnable;)V

    invoke-virtual {p0, v0}, Lcom/supertripper/app/TripperBleManager;->setKeepaliveEnabled(Z)V

    sget-object v0, Lcom/supertripper/app/TripperProtocol;->INSTANCE:Lcom/supertripper/app/TripperProtocol;

    invoke-virtual {v0}, Lcom/supertripper/app/TripperProtocol;->getPKT_CLOSE()[B

    move-result-object v0

    const-string v1, "CLOSE"

    invoke-direct {p0, v0, v1}, Lcom/supertripper/app/TripperBleManager;->enqueuePacket([BLjava/lang/String;)V

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->handler:Landroid/os/Handler;

    new-instance v1, Lcom/supertripper/app/w;

    const/4 v2, 0x6

    invoke-direct {v1, p0, v2}, Lcom/supertripper/app/w;-><init>(Lcom/supertripper/app/TripperBleManager;I)V

    const-wide/16 v2, 0x12c

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    return-void
.end method

.method public final forgetDevice(Ljava/lang/String;)V
    .locals 3

    const-string v0, "mac"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->getPrefs()Landroid/content/SharedPreferences;

    move-result-object v0

    sget-object v1, Lkotlin/collections/EmptySet;->b:Lkotlin/collections/EmptySet;

    const-string v2, "knownMacs"

    invoke-interface {v0, v2, v1}, Landroid/content/SharedPreferences;->getStringSet(Ljava/lang/String;Ljava/util/Set;)Ljava/util/Set;

    move-result-object v0

    if-nez v0, :cond_0

    goto :goto_0

    :cond_0
    move-object v1, v0

    :goto_0
    check-cast v1, Ljava/lang/Iterable;

    invoke-static {v1}, LY3/h;->E0(Ljava/lang/Iterable;)Ljava/util/Set;

    move-result-object v0

    invoke-interface {v0, p1}, Ljava/util/Set;->remove(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_1

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->getPrefs()Landroid/content/SharedPreferences;

    move-result-object v1

    invoke-interface {v1}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v1

    invoke-interface {v1, v2, v0}, Landroid/content/SharedPreferences$Editor;->putStringSet(Ljava/lang/String;Ljava/util/Set;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    const-string v0, " esquecido"

    invoke-virtual {p1, v0}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    sget-object v0, Lcom/supertripper/app/TripperBleManager$LogLevel;->WARN:Lcom/supertripper/app/TripperBleManager$LogLevel;

    invoke-direct {p0, p1, v0}, Lcom/supertripper/app/TripperBleManager;->logMsg(Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    :cond_1
    return-void
.end method

.method public final getCallIconActive()Z
    .locals 1

    iget-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->callIconActive:Z

    return v0
.end method

.method public final getConnectionState()Ljava/lang/String;
    .locals 3

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->gatt:Landroid/bluetooth/BluetoothGatt;

    if-eqz v0, :cond_1

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->writeChar:Landroid/bluetooth/BluetoothGattCharacteristic;

    if-eqz v1, :cond_1

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "Conectado ("

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    iget-object v1, p0, Lcom/supertripper/app/TripperBleManager;->currentDeviceMac:Ljava/lang/String;

    if-nez v1, :cond_0

    const-string v1, "?"

    :cond_0
    const/16 v2, 0x29

    invoke-static {v0, v1, v2}, Landroidx/compose/foundation/a;->s(Ljava/lang/StringBuilder;Ljava/lang/String;C)Ljava/lang/String;

    move-result-object v0

    goto :goto_0

    :cond_1
    if-eqz v0, :cond_2

    const-string v0, "Conectado sem servi\u00e7o"

    goto :goto_0

    :cond_2
    const-string v0, "Desconectado"

    :goto_0
    return-object v0
.end method

.method public final getKnownDevices()Ljava/util/Set;
    .locals 3
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Set<",
            "Ljava/lang/String;",
            ">;"
        }
    .end annotation

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->getPrefs()Landroid/content/SharedPreferences;

    move-result-object v0

    sget-object v1, Lkotlin/collections/EmptySet;->b:Lkotlin/collections/EmptySet;

    const-string v2, "knownMacs"

    invoke-interface {v0, v2, v1}, Landroid/content/SharedPreferences;->getStringSet(Ljava/lang/String;Ljava/util/Set;)Ljava/util/Set;

    move-result-object v0

    if-nez v0, :cond_0

    goto :goto_0

    :cond_0
    move-object v1, v0

    :goto_0
    return-object v1
.end method

.method public final getLastConnectedMac()Ljava/lang/String;
    .locals 3

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->getTripperPrefs()Landroid/content/SharedPreferences;

    move-result-object v0

    const-string v1, "lastConnectedMac"

    const/4 v2, 0x0

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public final getLastFirmware()Ljava/lang/String;
    .locals 3

    invoke-direct {p0}, Lcom/supertripper/app/TripperBleManager;->getTripperPrefs()Landroid/content/SharedPreferences;

    move-result-object v0

    const-string v1, "lastTripperFirmware"

    const/4 v2, 0x0

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public final getLastNavSummary()Ljava/lang/String;
    .locals 2

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->lastNavLabel:Ljava/lang/String;

    invoke-static {v0}, Lc5/l;->N(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_0

    const-string v0, "\u2014"

    :cond_0
    return-object v0
.end method

.method public final getLocked()Z
    .locals 1

    iget-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->locked:Z

    return v0
.end method

.method public final getNightMode()Z
    .locals 1

    iget-boolean v0, p0, Lcom/supertripper/app/TripperBleManager;->nightMode:Z

    return v0
.end method

.method public final getOnAlreadyPaired()Lkotlin/jvm/functions/Function0;
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Lkotlin/jvm/functions/Function0<",
            "Lkotlin/Unit;",
            ">;"
        }
    .end annotation

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onAlreadyPaired:Lkotlin/jvm/functions/Function0;

    return-object v0
.end method

.method public final getOnConnected()Lkotlin/jvm/functions/Function0;
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Lkotlin/jvm/functions/Function0<",
            "Lkotlin/Unit;",
            ">;"
        }
    .end annotation

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onConnected:Lkotlin/jvm/functions/Function0;

    return-object v0
.end method

.method public final getOnDisconnected()Lkotlin/jvm/functions/Function0;
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Lkotlin/jvm/functions/Function0<",
            "Lkotlin/Unit;",
            ">;"
        }
    .end annotation

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onDisconnected:Lkotlin/jvm/functions/Function0;

    return-object v0
.end method

.method public final getOnLog()Lkotlin/jvm/functions/Function2;
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Lkotlin/jvm/functions/Function2<",
            "Ljava/lang/String;",
            "Lcom/supertripper/app/TripperBleManager$LogLevel;",
            "Lkotlin/Unit;",
            ">;"
        }
    .end annotation

    iget-object v0, p0, Lcom/supertripper/app/TripperBleManager;->onLog:Lkotlin/jvm/functions/Function2;

    return-object v0
.end method

.method public final getOnNotification()Lkotlin/jvm/functions/Function1;
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Lkotlin/jvm/functions/Function1<",
            "[B",
            "Lkotlin/Unit;",
            ">;"
        }
    .end annotation

