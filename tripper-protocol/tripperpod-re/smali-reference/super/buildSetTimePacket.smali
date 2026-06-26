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
