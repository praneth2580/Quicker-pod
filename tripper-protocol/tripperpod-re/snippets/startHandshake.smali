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
