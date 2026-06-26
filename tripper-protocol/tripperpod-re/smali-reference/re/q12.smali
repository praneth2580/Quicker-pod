.class public final Lbluconnect/q12;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lbluconnect/q12$a;
    }
.end annotation


# static fields
.field public static final m:Lbluconnect/q12$a;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public static final n:Ljava/lang/String; = "q12"


# instance fields
.field public final a:Landroid/content/Context;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public final b:Lbluconnect/vn5;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public final c:Landroidx/lifecycle/MutableLiveData;
    .annotation build Lbluconnect/smh;
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Landroidx/lifecycle/MutableLiveData<",
            "Ljava/lang/String;",
            ">;"
        }
    .end annotation
.end field

.field public final d:Lbluconnect/ssb;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public final e:Ljava/util/Queue;
    .annotation build Lbluconnect/ejh;
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/Queue<",
            "[B>;"
        }
    .end annotation
.end field

.field public f:Landroid/os/BatteryManager;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field

.field public g:I

.field public h:Z

.field public i:Ljava/util/Timer;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field

.field public j:B

.field public k:Z

.field public l:Ljava/lang/String;
    .annotation build Lbluconnect/smh;
    .end annotation
.end field


# direct methods
.method static constructor <clinit>()V
    .locals 1

    new-instance v0, Lbluconnect/q12$a;

    invoke-direct {v0}, Ljava/lang/Object;-><init>()V

    sput-object v0, Lbluconnect/q12;->m:Lbluconnect/q12$a;

    return-void
.end method

.method public constructor <init>(Landroid/content/Context;Lbluconnect/vn5;Landroidx/lifecycle/MutableLiveData;)V
    .locals 1
    .param p1    # Landroid/content/Context;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .param p2    # Lbluconnect/vn5;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .param p3    # Landroidx/lifecycle/MutableLiveData;
        .annotation build Lbluconnect/smh;
        .end annotation
    .end param
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Context;",
            "Lbluconnect/vn5;",
            "Landroidx/lifecycle/MutableLiveData<",
            "Ljava/lang/String;",
            ">;)V"
        }
    .end annotation

    const-string v0, "context"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    const-string v0, "configurationPrefManager"

    invoke-static {p2, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p1, p0, Lbluconnect/q12;->a:Landroid/content/Context;

    iput-object p2, p0, Lbluconnect/q12;->b:Lbluconnect/vn5;

    iput-object p3, p0, Lbluconnect/q12;->c:Landroidx/lifecycle/MutableLiveData;

    sget-object p1, Lbluconnect/p12;->a:Lbluconnect/p12;

    invoke-virtual {p1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    new-instance p1, Lbluconnect/o12;

    invoke-direct {p1}, Lbluconnect/o12;-><init>()V

    iput-object p1, p0, Lbluconnect/q12;->d:Lbluconnect/ssb;

    sget-object p1, Lbluconnect/o12;->s:Ljava/util/Queue;

    iput-object p1, p0, Lbluconnect/q12;->e:Ljava/util/Queue;

    const/4 p1, -0x1

    iput p1, p0, Lbluconnect/q12;->g:I

    const/4 p1, 0x3

    iput-byte p1, p0, Lbluconnect/q12;->j:B

    const/4 p1, 0x1

    iput-boolean p1, p0, Lbluconnect/q12;->k:Z

    return-void
.end method

.method public static final synthetic a(Lbluconnect/q12;)[B
    .locals 0

    invoke-virtual {p0}, Lbluconnect/q12;->i()[B

    move-result-object p0

    return-object p0
.end method

.method public static final synthetic b(Lbluconnect/q12;)B
    .locals 0

    iget-byte p0, p0, Lbluconnect/q12;->j:B

    return p0
.end method

.method public static final synthetic c(Lbluconnect/q12;)Ljava/util/Queue;
    .locals 0

    iget-object p0, p0, Lbluconnect/q12;->e:Ljava/util/Queue;

    return-object p0
.end method

.method public static final synthetic d(Lbluconnect/q12;)Z
    .locals 0

    iget-boolean p0, p0, Lbluconnect/q12;->h:Z

    return p0
.end method

.method public static final synthetic e()Ljava/lang/String;
    .locals 1

    sget-object v0, Lbluconnect/q12;->n:Ljava/lang/String;

    return-object v0
.end method

.method public static final synthetic f(Lbluconnect/q12;Z)V
    .locals 0

    iput-boolean p1, p0, Lbluconnect/q12;->k:Z

    return-void
.end method

.method public static final synthetic g(Lbluconnect/q12;[B)V
    .locals 0

    invoke-virtual {p0, p1}, Lbluconnect/q12;->t([B)V

    return-void
.end method

.method public static synthetic p(Lbluconnect/q12;IILbluconnect/h2h;ILjava/lang/Object;)V
    .locals 0

    and-int/lit8 p4, p4, 0x4

    if-eqz p4, :cond_0

    const/4 p3, 0x0

    :cond_0
    invoke-virtual {p0, p1, p2, p3}, Lbluconnect/q12;->o(IILbluconnect/h2h;)V

    return-void
.end method


# virtual methods
.method public final h()V
    .locals 2

    const/4 v0, 0x0

    :try_start_0
    iget-object v1, p0, Lbluconnect/q12;->i:Ljava/util/Timer;

    if-eqz v1, :cond_1

    if-eqz v1, :cond_0

    invoke-virtual {v1}, Ljava/util/Timer;->cancel()V

    goto :goto_0

    :catch_0
    move-exception v1

    goto :goto_1

    :cond_0
    :goto_0
    iput-object v0, p0, Lbluconnect/q12;->i:Ljava/util/Timer;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    :cond_1
    return-void

    :goto_1
    iput-object v0, p0, Lbluconnect/q12;->i:Ljava/util/Timer;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    invoke-virtual {v1}, Ljava/lang/Throwable;->getCause()Ljava/lang/Throwable;

    move-result-object p0

    invoke-static {p0}, Ljava/util/Objects;->toString(Ljava/lang/Object;)Ljava/lang/String;

    return-void
.end method

.method public final i()[B
    .locals 19

    move-object/from16 v0, p0

    iget-object v1, v0, Lbluconnect/q12;->b:Lbluconnect/vn5;

    invoke-virtual {v1}, Lbluconnect/vn5;->t()Z

    move-result v18

    invoke-virtual {v0}, Lbluconnect/q12;->j()V

    invoke-virtual {v0}, Lbluconnect/q12;->l()Z

    move-result v1

    if-eqz v1, :cond_0

    sget-object v0, Lbluconnect/s4p;->K3:Lbluconnect/s4p;

    iget v0, v0, Lbluconnect/s4p;->v2:I

    :goto_0
    move v5, v0

    goto :goto_1

    :cond_0
    iget-object v0, v0, Lbluconnect/q12;->a:Landroid/content/Context;

    invoke-static {v0}, Lbluconnect/ugk;->d1(Landroid/content/Context;)Z

    move-result v0

    if-nez v0, :cond_1

    sget-object v0, Lbluconnect/s4p;->L3:Lbluconnect/s4p;

    iget v0, v0, Lbluconnect/s4p;->v2:I

    goto :goto_0

    :cond_1
    sget-object v0, Lbluconnect/s4p;->M3:Lbluconnect/s4p;

    iget v0, v0, Lbluconnect/s4p;->v2:I

    goto :goto_0

    :goto_1
    sget-object v2, Lbluconnect/k2h;->a:Lbluconnect/k2h;

    const/16 v16, 0x0

    const/16 v17, 0x0

    const/4 v3, 0x1

    const/4 v4, 0x1

    const/4 v6, 0x0

    const/4 v7, 0x0

    const/4 v8, 0x1

    const/4 v9, -0x1

    const/4 v10, 0x0

    const/4 v11, 0x0

    const/4 v12, 0x0

    const/4 v13, 0x0

    const/4 v14, 0x0

    const/4 v15, 0x0

    invoke-virtual/range {v2 .. v18}, Lbluconnect/k2h;->d(IIIIIIIIIIIIIIII)[B

    move-result-object v0

    return-object v0
.end method

.method public final j()V
    .locals 2

    iget-object v0, p0, Lbluconnect/q12;->f:Landroid/os/BatteryManager;

    if-eqz v0, :cond_0

    invoke-static {v0}, Lkotlin/jvm/internal/Intrinsics;->m(Ljava/lang/Object;)V

    const/4 v1, 0x4

    invoke-virtual {v0, v1}, Landroid/os/BatteryManager;->getIntProperty(I)I

    move-result v0

    iput v0, p0, Lbluconnect/q12;->g:I

    :cond_0
    return-void
.end method

.method public final k()V
    .locals 2

    iget-object v0, p0, Lbluconnect/q12;->a:Landroid/content/Context;

    const-string v1, "batterymanager"

    invoke-virtual {v0, v1}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    const-string v1, "null cannot be cast to non-null type android.os.BatteryManager"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->n(Ljava/lang/Object;Ljava/lang/String;)V

    check-cast v0, Landroid/os/BatteryManager;

    iput-object v0, p0, Lbluconnect/q12;->f:Landroid/os/BatteryManager;

    return-void
.end method

.method public final l()Z
    .locals 3

    iget p0, p0, Lbluconnect/q12;->g:I

    const/4 v0, 0x0

    const/4 v1, 0x1

    if-gt v1, p0, :cond_0

    const/16 v2, 0xb

    if-ge p0, v2, :cond_0

    return v1

    :cond_0
    return v0
.end method

.method public final m(B)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    iput-boolean v0, p0, Lbluconnect/q12;->k:Z

    iput-byte p1, p0, Lbluconnect/q12;->j:B

    invoke-static {}, Lbluconnect/p9k;->y()Lbluconnect/p9k;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/p9k;->V0()Z

    move-result v1

    const/4 v2, 0x1

    if-eqz v1, :cond_1

    invoke-static {}, Lbluconnect/p9k;->y()Lbluconnect/p9k;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/p9k;->H0()Z

    move-result v1

    if-eqz v1, :cond_1

    const/16 v1, 0x14

    new-array v1, v1, [B

    const/16 v3, 0x40

    aput-byte v3, v1, v0

    aput-byte p1, v1, v2

    const/16 p1, 0x12

    new-array v3, p1, [B

    move v4, v0

    :goto_0
    if-ge v4, p1, :cond_0

    aget-byte v5, v1, v4

    aput-byte v5, v3, v4

    aget-byte v5, v1, v4

    add-int/lit8 v4, v4, 0x1

    goto :goto_0

    :cond_0
    invoke-static {v3}, Lbluconnect/xj3;->a([B)[B

    move-result-object v3

    aget-byte v0, v3, v0

    aput-byte v0, v1, p1

    aget-byte p1, v3, v2

    const/16 v0, 0x13

    aput-byte p1, v1, v0

    invoke-virtual {p0, v1}, Lbluconnect/q12;->t([B)V

    iget-object p1, p0, Lbluconnect/q12;->e:Ljava/util/Queue;

    invoke-interface {p1, v1}, Ljava/util/Queue;->offer(Ljava/lang/Object;)Z

    :cond_1
    iget-byte p1, p0, Lbluconnect/q12;->j:B

    if-eq p1, v2, :cond_2

    const/4 v0, 0x2

    if-eq p1, v0, :cond_2

    const/4 v0, 0x3

    if-eq p1, v0, :cond_2

    const/4 v0, 0x4

    if-ne p1, v0, :cond_3

    :cond_2
    iput-boolean v2, p0, Lbluconnect/q12;->k:Z

    :cond_3
    sget-object p0, Lbluconnect/q12;->n:Ljava/lang/String;

    const-string p1, "notifyCallToTFT:done"

    invoke-static {p0, p1}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/Throwable;->printStackTrace()V

    return-void
.end method

.method public final n()V
    .locals 6

    :try_start_0
    new-instance v0, Ljava/util/Timer;

    invoke-direct {v0}, Ljava/util/Timer;-><init>()V

    iput-object v0, p0, Lbluconnect/q12;->i:Ljava/util/Timer;

    new-instance v1, Lbluconnect/q12$b;

    invoke-direct {v1, p0}, Lbluconnect/q12$b;-><init>(Lbluconnect/q12;)V

    const-wide/16 v2, 0x0

    const-wide/16 v4, 0x3e8

    invoke-virtual/range {v0 .. v5}, Ljava/util/Timer;->scheduleAtFixedRate(Ljava/util/TimerTask;JJ)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    move-object p0, v0

    invoke-virtual {p0}, Ljava/lang/Throwable;->getMessage()Ljava/lang/String;

    invoke-virtual {p0}, Ljava/lang/Throwable;->getCause()Ljava/lang/Throwable;

    move-result-object p0

    invoke-static {p0}, Ljava/util/Objects;->toString(Ljava/lang/Object;)Ljava/lang/String;

    return-void
.end method

.method public final o(IILbluconnect/h2h;)V
    .locals 2
    .param p3    # Lbluconnect/h2h;
        .annotation build Lbluconnect/smh;
        .end annotation
    .end param

    iget-boolean v0, p0, Lbluconnect/q12;->h:Z

    if-nez v0, :cond_2

    invoke-static {}, Lbluconnect/p9k;->y()Lbluconnect/p9k;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/p9k;->V0()Z

    move-result v0

    if-eqz v0, :cond_1

    invoke-static {}, Lbluconnect/p9k;->y()Lbluconnect/p9k;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/p9k;->H0()Z

    move-result v0

    if-eqz v0, :cond_1

    invoke-static {}, Lbluconnect/p9k;->y()Lbluconnect/p9k;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/p9k;->y0()Z

    move-result v0

    if-eqz v0, :cond_0

    iget-byte v0, p0, Lbluconnect/q12;->j:B

    const/4 v1, 0x5

    if-ne v0, v1, :cond_0

    const/4 p1, 0x0

    iput-boolean p1, p0, Lbluconnect/q12;->k:Z

    iget-object p1, p0, Lbluconnect/q12;->e:Ljava/util/Queue;

    invoke-interface {p1}, Ljava/util/Collection;->clear()V

    invoke-virtual {p0, v1}, Lbluconnect/q12;->m(B)V

    return-void

    :cond_0
    iget-boolean v0, p0, Lbluconnect/q12;->k:Z

    if-eqz v0, :cond_2

    if-eqz p3, :cond_2

    invoke-virtual {p3}, Lbluconnect/h2h;->c()Ljava/lang/Integer;

    move-result-object v0

    if-eqz v0, :cond_2

    invoke-virtual {p0, p1, p2, p3}, Lbluconnect/q12;->q(IILbluconnect/h2h;)V

    return-void

    :cond_1
    iget-object p0, p0, Lbluconnect/q12;->e:Ljava/util/Queue;

    invoke-interface {p0}, Ljava/util/Collection;->clear()V

    :cond_2
    return-void
.end method

.method public final q(IILbluconnect/h2h;)V
    .locals 22

    move-object/from16 v0, p0

    invoke-virtual/range {p3 .. p3}, Lbluconnect/h2h;->c()Ljava/lang/Integer;

    move-result-object v1

    const/4 v2, 0x0

    if-eqz v1, :cond_0

    invoke-virtual {v1}, Ljava/lang/Integer;->intValue()I

    move-result v1

    goto :goto_0

    :cond_0
    move v1, v2

    :goto_0
    sget-object v3, Lbluconnect/j2h;->a:Lbluconnect/j2h;

    invoke-static {}, Lbluconnect/ugk;->b1()Z

    move-result v4

    invoke-virtual {v3, v1, v4}, Lbluconnect/j2h;->a(IZ)Lbluconnect/di7;

    move-result-object v4

    invoke-virtual {v4}, Lbluconnect/di7;->component1()I

    move-result v9

    invoke-virtual {v4}, Lbluconnect/di7;->component2()I

    move-result v11

    move/from16 v4, p1

    invoke-static {v1, v4}, Lbluconnect/ii7;->h(II)I

    move-result v10

    invoke-static/range {p3 .. p3}, Lbluconnect/f2h;->o(Lbluconnect/h2h;)Z

    move-result v5

    const/4 v6, -0x1

    if-eqz v5, :cond_1

    const/4 v5, 0x5

    if-lt v10, v5, :cond_2

    :cond_1
    move v12, v6

    goto :goto_1

    :cond_2
    move/from16 v12, p2

    :goto_1
    invoke-static {}, Lbluconnect/ugk;->b1()Z

    move-result v5

    invoke-virtual {v3, v1, v5}, Lbluconnect/j2h;->a(IZ)Lbluconnect/di7;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/di7;->component1()I

    move-result v13

    invoke-virtual {v1}, Lbluconnect/di7;->component2()I

    move-result v14

    invoke-virtual/range {p3 .. p3}, Lbluconnect/h2h;->c()Ljava/lang/Integer;

    move-result-object v1

    iget-object v5, v0, Lbluconnect/q12;->b:Lbluconnect/vn5;

    invoke-static {v1, v5}, Lbluconnect/ii7;->i(Ljava/lang/Integer;Lbluconnect/vn5;)I

    move-result v15

    invoke-virtual/range {p3 .. p3}, Lbluconnect/h2h;->e()Ljava/lang/Integer;

    move-result-object v1

    if-eqz v1, :cond_3

    invoke-virtual {v1}, Ljava/lang/Integer;->intValue()I

    move-result v1

    goto :goto_2

    :cond_3
    move v1, v2

    :goto_2
    invoke-static {}, Lbluconnect/ugk;->b1()Z

    move-result v5

    invoke-virtual {v3, v1, v5}, Lbluconnect/j2h;->a(IZ)Lbluconnect/di7;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/di7;->getDistance()I

    move-result v5

    invoke-virtual {v1}, Lbluconnect/di7;->getUnits()I

    move-result v1

    iget-object v6, v0, Lbluconnect/q12;->b:Lbluconnect/vn5;

    invoke-virtual {v6}, Lbluconnect/vn5;->t()Z

    move-result v6

    iget-object v7, v0, Lbluconnect/q12;->b:Lbluconnect/vn5;

    invoke-virtual {v7}, Lbluconnect/vn5;->a()Ljava/lang/Boolean;

    move-result-object v7

    invoke-virtual {v7}, Ljava/lang/Boolean;->booleanValue()Z

    move-result v7

    if-eqz v7, :cond_5

    invoke-virtual/range {p3 .. p3}, Lbluconnect/h2h;->l()Ljava/lang/Integer;

    move-result-object v1

    if-eqz v1, :cond_4

    invoke-virtual {v1}, Ljava/lang/Integer;->intValue()I

    move-result v1

    goto :goto_3

    :cond_4
    move v1, v2

    :goto_3
    iget-object v7, v0, Lbluconnect/q12;->a:Landroid/content/Context;

    invoke-virtual {v3, v7, v1, v2}, Lbluconnect/j2h;->d(Landroid/content/Context;IZ)Lbluconnect/ys8;

    move-result-object v1

    invoke-virtual {v1}, Lbluconnect/ys8;->component1()I

    move-result v3

    invoke-virtual {v1}, Lbluconnect/ys8;->component2()I

    move-result v7

    invoke-virtual {v1}, Lbluconnect/ys8;->component3()I

    move-result v1

    move/from16 v17, v2

    move/from16 v19, v3

    move/from16 v20, v7

    move v2, v1

    goto :goto_4

    :cond_5
    move/from16 v17, v1

    move/from16 v19, v2

    move/from16 v20, v19

    :goto_4
    invoke-virtual {v0}, Lbluconnect/q12;->j()V

    invoke-virtual {v0}, Lbluconnect/q12;->l()Z

    move-result v1

    if-eqz v1, :cond_6

    sget-object v1, Lbluconnect/s4p;->K3:Lbluconnect/s4p;

    iget v1, v1, Lbluconnect/s4p;->v2:I

    move v8, v1

    goto :goto_5

    :cond_6
    move v8, v4

    :goto_5
    sget-object v1, Lbluconnect/q12;->n:Ljava/lang/String;

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "ETAFormat: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "Mode: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v6}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "Primary Turn: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v8}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "Secondary Turn: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v12}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "Primary Distance: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v9}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "Secondary Distance: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v13}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    new-instance v3, Ljava/lang/StringBuilder;

    const-string v4, "Total Distance: "

    invoke-direct {v3, v4}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v3, v5}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    const-string v3, "<-------------------------------->"

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    move/from16 v16, v5

    sget-object v5, Lbluconnect/k2h;->a:Lbluconnect/k2h;

    move/from16 v21, v6

    const/4 v6, 0x1

    const/4 v7, 0x1

    move/from16 v18, v2

    invoke-virtual/range {v5 .. v21}, Lbluconnect/k2h;->d(IIIIIIIIIIIIIIII)[B

    move-result-object v2

    const-string v3, "BLE Message Offered"

    invoke-static {v1, v3}, Lcom/newrelic/agent/android/instrumentation/LogInstrumentation;->d(Ljava/lang/String;Ljava/lang/String;)I

    invoke-virtual {v0, v2}, Lbluconnect/q12;->t([B)V

    iget-object v0, v0, Lbluconnect/q12;->e:Ljava/util/Queue;

    invoke-interface {v0, v2}, Ljava/util/Queue;->offer(Ljava/lang/Object;)Z

    return-void
.end method

.method public final r(Ljava/lang/String;)V
    .locals 1
    .param p1    # Ljava/lang/String;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string v0, "maneuverData"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object p1, p0, Lbluconnect/q12;->l:Ljava/lang/String;

    return-void
.end method

.method public final s(Z)V
    .locals 1

    iput-boolean p1, p0, Lbluconnect/q12;->h:Z

    if-eqz p1, :cond_0

    iget-object v0, p0, Lbluconnect/q12;->i:Ljava/util/Timer;

    if-nez v0, :cond_0

    invoke-virtual {p0}, Lbluconnect/q12;->n()V

    return-void

    :cond_0
    if-nez p1, :cond_1

    iget-object p1, p0, Lbluconnect/q12;->i:Ljava/util/Timer;

    if-eqz p1, :cond_1

    invoke-virtual {p0}, Lbluconnect/q12;->h()V

    :cond_1
    return-void
.end method

.method public final t([B)V
    .locals 1

    iget-object p0, p0, Lbluconnect/q12;->c:Landroidx/lifecycle/MutableLiveData;

    if-eqz p0, :cond_0

    sget-object v0, Lbluconnect/k2h;->a:Lbluconnect/k2h;

    invoke-virtual {v0, p1}, Lbluconnect/k2h;->a([B)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroidx/lifecycle/MutableLiveData;->postValue(Ljava/lang/Object;)V

    :cond_0
    return-void
.end method
