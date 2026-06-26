.class public Lbluconnect/xj3;
.super Ljava/lang/Object;
.source "SourceFile"

# interfaces
.implements Ljava/util/zip/Checksum;


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation


# static fields
.field public static final d:I = 0x1021

.field public static final e:S = -0x1s


# instance fields
.field public final a:S

.field public final b:[S

.field public c:S


# direct methods
.method public constructor <init>(IS)V
    .locals 4
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0
        }
        names = {
            "polynomial",
            "init"
        }
    .end annotation

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/16 v0, 0x100

    new-array v1, v0, [S

    iput-object v1, p0, Lbluconnect/xj3;->b:[S

    iput-short p2, p0, Lbluconnect/xj3;->a:S

    iput-short p2, p0, Lbluconnect/xj3;->c:S

    const/4 p2, 0x0

    :goto_0
    if-ge p2, v0, :cond_2

    shl-int/lit8 v1, p2, 0x8

    const/16 v2, 0x8

    :goto_1
    if-lez v2, :cond_1

    const v3, 0x8000

    and-int/2addr v3, v1

    if-eqz v3, :cond_0

    shl-int/lit8 v1, v1, 0x1

    xor-int/2addr v1, p1

    goto :goto_2

    :cond_0
    shl-int/lit8 v1, v1, 0x1

    :goto_2
    add-int/lit8 v2, v2, -0x1

    goto :goto_1

    :cond_1
    iget-object v2, p0, Lbluconnect/xj3;->b:[S

    int-to-short v1, v1

    aput-short v1, v2, p2

    add-int/lit8 p2, p2, 0x1

    goto :goto_0

    :cond_2
    return-void
.end method

.method public static a([B)[B
    .locals 4
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "data"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    new-instance v0, Lbluconnect/xj3;

    const/16 v1, 0x1021

    const/4 v2, -0x1

    invoke-direct {v0, v1, v2}, Lbluconnect/xj3;-><init>(IS)V

    array-length v1, p0

    const/4 v2, 0x0

    invoke-virtual {v0, p0, v2, v1}, Lbluconnect/xj3;->update([BII)V

    iget-short p0, v0, Lbluconnect/xj3;->c:S

    int-to-long v0, p0

    long-to-int p0, v0

    invoke-static {p0}, Lbluconnect/xj3;->c(I)[B

    move-result-object p0

    const/4 v0, 0x2

    aget-byte v1, p0, v0

    const/4 v3, 0x3

    aget-byte p0, p0, v3

    new-array v0, v0, [B

    aput-byte v1, v0, v2

    const/4 v1, 0x1

    aput-byte p0, v0, v1

    return-object v0
.end method

.method public static b([B)[B
    .locals 10
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "inputBytes"
        }
    .end annotation

    array-length v0, p0

    const v1, 0xffff

    const/4 v2, 0x0

    move v4, v1

    move v3, v2

    :goto_0
    const/4 v5, 0x1

    if-ge v3, v0, :cond_4

    aget-byte v6, p0, v3

    move v7, v2

    :goto_1
    const/16 v8, 0x8

    if-ge v7, v8, :cond_3

    rsub-int/lit8 v8, v7, 0x7

    shr-int v8, v6, v8

    and-int/2addr v8, v5

    if-ne v8, v5, :cond_0

    move v8, v5

    goto :goto_2

    :cond_0
    move v8, v2

    :goto_2
    shr-int/lit8 v9, v4, 0xf

    and-int/2addr v9, v5

    if-ne v9, v5, :cond_1

    move v9, v5

    goto :goto_3

    :cond_1
    move v9, v2

    :goto_3
    shl-int/lit8 v4, v4, 0x1

    xor-int/2addr v8, v9

    if-eqz v8, :cond_2

    xor-int/lit16 v4, v4, 0x1021

    :cond_2
    add-int/lit8 v7, v7, 0x1

    goto :goto_1

    :cond_3
    add-int/lit8 v3, v3, 0x1

    goto :goto_0

    :cond_4
    and-int p0, v4, v1

    const/4 v0, 0x4

    invoke-static {v0}, Ljava/nio/ByteBuffer;->allocate(I)Ljava/nio/ByteBuffer;

    move-result-object v0

    invoke-virtual {v0, p0}, Ljava/nio/ByteBuffer;->putInt(I)Ljava/nio/ByteBuffer;

    invoke-virtual {v0}, Ljava/nio/ByteBuffer;->array()[B

    move-result-object p0

    const/4 v0, 0x2

    aget-byte v1, p0, v0

    const/4 v3, 0x3

    aget-byte p0, p0, v3

    new-array v0, v0, [B

    aput-byte v1, v0, v2

    aput-byte p0, v0, v5

    return-object v0
.end method

.method public static c(I)[B
    .locals 2
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x10
        }
        names = {
            "i"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    new-instance v0, Ljava/io/ByteArrayOutputStream;

    invoke-direct {v0}, Ljava/io/ByteArrayOutputStream;-><init>()V

    new-instance v1, Ljava/io/DataOutputStream;

    invoke-direct {v1, v0}, Ljava/io/DataOutputStream;-><init>(Ljava/io/OutputStream;)V

    invoke-virtual {v1, p0}, Ljava/io/DataOutputStream;->writeInt(I)V

    invoke-virtual {v1}, Ljava/io/DataOutputStream;->flush()V

    invoke-virtual {v0}, Ljava/io/ByteArrayOutputStream;->toByteArray()[B

    move-result-object p0

    return-object p0
.end method


# virtual methods
.method public getValue()J
    .locals 2

    iget-short p0, p0, Lbluconnect/xj3;->c:S

    int-to-long v0, p0

    return-wide v0
.end method

.method public reset()V
    .locals 1

    iget-short v0, p0, Lbluconnect/xj3;->a:S

    iput-short v0, p0, Lbluconnect/xj3;->c:S

    return-void
.end method

.method public update(I)V
    .locals 3
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "b"
        }
    .end annotation

    int-to-byte p1, p1

    const/4 v0, 0x1

    .line 4
    new-array v1, v0, [B

    const/4 v2, 0x0

    aput-byte p1, v1, v2

    invoke-virtual {p0, v1, v2, v0}, Lbluconnect/xj3;->update([BII)V

    return-void
.end method

.method public update([B)V
    .locals 2
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "buffer"
        }
    .end annotation

    const/4 v0, 0x0

    .line 3
    array-length v1, p1

    invoke-virtual {p0, p1, v0, v1}, Lbluconnect/xj3;->update([BII)V

    return-void
.end method

.method public update([BII)V
    .locals 4
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0,
            0x0
        }
        names = {
            "buffer",
            "offset",
            "len"
        }
    .end annotation

    const/4 v0, 0x0

    :goto_0
    if-ge v0, p3, :cond_0

    add-int v1, p2, v0

    .line 1
    aget-byte v1, p1, v1

    iget-short v2, p0, Lbluconnect/xj3;->c:S

    ushr-int/lit8 v3, v2, 0x8

    xor-int/2addr v1, v3

    .line 2
    iget-object v3, p0, Lbluconnect/xj3;->b:[S

    and-int/lit16 v1, v1, 0xff

    aget-short v1, v3, v1

    shl-int/lit8 v2, v2, 0x8

    xor-int/2addr v1, v2

    int-to-short v1, v1

    iput-short v1, p0, Lbluconnect/xj3;->c:S

    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_0
    return-void
.end method
