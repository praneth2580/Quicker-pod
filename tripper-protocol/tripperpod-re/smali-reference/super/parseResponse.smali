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
