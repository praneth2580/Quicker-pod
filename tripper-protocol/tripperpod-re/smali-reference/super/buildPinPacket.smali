.method public final buildPinPacket(Ljava/lang/String;)[B
    .locals 4

    const-string v0, "code"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    const/16 v0, 0x14

    new-array v0, v0, [B

    const/4 v1, 0x0

    const/16 v2, 0x20

    aput-byte v2, v0, v1

    sget-object v2, Lkotlin/text/Charsets;->c:Ljava/nio/charset/Charset;

    invoke-virtual {p1, v2}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object p1

    const-string v2, "getBytes(...)"

    invoke-static {p1, v2}, Lkotlin/jvm/internal/Intrinsics;->e(Ljava/lang/Object;Ljava/lang/String;)V

    array-length v2, p1

    const/4 v3, 0x6

    invoke-static {v2, v3}, Ljava/lang/Math;->min(II)I

    move-result v2

    const/4 v3, 0x1

    invoke-static {p1, v3, v0, v1, v2}, LK5/b;->e([BI[BII)V

    invoke-direct {p0, v0}, Lcom/supertripper/app/TripperProtocol;->appendCrc([B)[B

    move-result-object p1

    return-object p1
.end method
