.class public Lbluconnect/h2h;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lbluconnect/h2h$a;
    }
.end annotation


# instance fields
.field public final a:I

.field public final b:Lbluconnect/beo;
    .annotation runtime Lbluconnect/rmh;
    .end annotation
.end field

.field public final c:[Lbluconnect/beo;

.field public final d:Z

.field public final e:Ljava/lang/Integer;
    .annotation runtime Lbluconnect/rmh;
    .end annotation
.end field

.field public final f:Ljava/lang/Integer;
    .annotation runtime Lbluconnect/rmh;
    .end annotation
.end field

.field public final g:Ljava/lang/Integer;
    .annotation runtime Lbluconnect/rmh;
    .end annotation
.end field

.field public final h:Ljava/lang/Integer;
    .annotation runtime Lbluconnect/rmh;
    .end annotation
.end field

.field public final i:Ljava/lang/Integer;
    .annotation runtime Lbluconnect/rmh;
    .end annotation
.end field

.field public final j:Ljava/lang/Integer;
    .annotation runtime Lbluconnect/rmh;
    .end annotation
.end field


# direct methods
.method public constructor <init>(ILbluconnect/beo;[Lbluconnect/beo;ZLjava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;)V
    .locals 0
    .param p2    # Lbluconnect/beo;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param
    .param p3    # [Lbluconnect/beo;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param
    .param p5    # Ljava/lang/Integer;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param
    .param p6    # Ljava/lang/Integer;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param
    .param p7    # Ljava/lang/Integer;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param
    .param p8    # Ljava/lang/Integer;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param
    .param p9    # Ljava/lang/Integer;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param
    .param p10    # Ljava/lang/Integer;
        .annotation runtime Lbluconnect/rmh;
        .end annotation
    .end param

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput p1, p0, Lbluconnect/h2h;->a:I

    iput-object p2, p0, Lbluconnect/h2h;->b:Lbluconnect/beo;

    iput-object p3, p0, Lbluconnect/h2h;->c:[Lbluconnect/beo;

    iput-boolean p4, p0, Lbluconnect/h2h;->d:Z

    iput-object p5, p0, Lbluconnect/h2h;->e:Ljava/lang/Integer;

    iput-object p6, p0, Lbluconnect/h2h;->f:Ljava/lang/Integer;

    iput-object p7, p0, Lbluconnect/h2h;->g:Ljava/lang/Integer;

    iput-object p8, p0, Lbluconnect/h2h;->h:Ljava/lang/Integer;

    iput-object p9, p0, Lbluconnect/h2h;->i:Ljava/lang/Integer;

    iput-object p10, p0, Lbluconnect/h2h;->j:Ljava/lang/Integer;

    return-void
.end method

.method public static a()Lbluconnect/h2h$a;
    .locals 1

    new-instance v0, Lbluconnect/h2h$a;

    invoke-direct {v0}, Lbluconnect/h2h$a;-><init>()V

    return-object v0
.end method


# virtual methods
.method public b()Lbluconnect/beo;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    iget-object p0, p0, Lbluconnect/h2h;->b:Lbluconnect/beo;

    return-object p0
.end method

.method public c()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    iget-object p0, p0, Lbluconnect/h2h;->f:Ljava/lang/Integer;

    return-object p0
.end method

.method public d()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    .annotation runtime Ljava/lang/Deprecated;
    .end annotation

    invoke-virtual {p0}, Lbluconnect/h2h;->e()Ljava/lang/Integer;

    move-result-object p0

    return-object p0
.end method

.method public e()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    iget-object p0, p0, Lbluconnect/h2h;->j:Ljava/lang/Integer;

    return-object p0
.end method

.method public f()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    iget-object p0, p0, Lbluconnect/h2h;->h:Ljava/lang/Integer;

    return-object p0
.end method

.method public g()I
    .locals 0

    iget p0, p0, Lbluconnect/h2h;->a:I

    return p0
.end method

.method public h()[Lbluconnect/beo;
    .locals 0

    iget-object p0, p0, Lbluconnect/h2h;->c:[Lbluconnect/beo;

    return-object p0
.end method

.method public i()Z
    .locals 0

    iget-boolean p0, p0, Lbluconnect/h2h;->d:Z

    return p0
.end method

.method public j()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    iget-object p0, p0, Lbluconnect/h2h;->e:Ljava/lang/Integer;

    return-object p0
.end method

.method public k()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    .annotation runtime Ljava/lang/Deprecated;
    .end annotation

    invoke-virtual {p0}, Lbluconnect/h2h;->l()Ljava/lang/Integer;

    move-result-object p0

    return-object p0
.end method

.method public l()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    iget-object p0, p0, Lbluconnect/h2h;->i:Ljava/lang/Integer;

    return-object p0
.end method

.method public m()Ljava/lang/Integer;
    .locals 0
    .annotation runtime Lbluconnect/rmh;
    .end annotation

    iget-object p0, p0, Lbluconnect/h2h;->g:Ljava/lang/Integer;

    return-object p0
.end method

.method public n()Lbluconnect/h2h$a;
    .locals 11

    new-instance v0, Lbluconnect/h2h$a;

    iget v1, p0, Lbluconnect/h2h;->a:I

    iget-object v2, p0, Lbluconnect/h2h;->b:Lbluconnect/beo;

    iget-object v3, p0, Lbluconnect/h2h;->c:[Lbluconnect/beo;

    iget-boolean v4, p0, Lbluconnect/h2h;->d:Z

    iget-object v5, p0, Lbluconnect/h2h;->e:Ljava/lang/Integer;

    iget-object v6, p0, Lbluconnect/h2h;->f:Ljava/lang/Integer;

    iget-object v7, p0, Lbluconnect/h2h;->g:Ljava/lang/Integer;

    iget-object v8, p0, Lbluconnect/h2h;->h:Ljava/lang/Integer;

    iget-object v9, p0, Lbluconnect/h2h;->i:Ljava/lang/Integer;

    iget-object v10, p0, Lbluconnect/h2h;->j:Ljava/lang/Integer;

    invoke-direct/range {v0 .. v10}, Lbluconnect/h2h$a;-><init>(ILbluconnect/beo;[Lbluconnect/beo;ZLjava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;Ljava/lang/Integer;)V

    return-object v0
.end method
