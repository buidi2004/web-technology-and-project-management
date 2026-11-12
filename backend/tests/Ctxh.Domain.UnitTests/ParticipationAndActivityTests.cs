using Ctxh.Domain.Entities;
using Ctxh.Domain.Enums;
using Ctxh.Domain.Exceptions;

namespace Ctxh.Domain.UnitTests;

public class ParticipationTests
{
    private static readonly DateTime Now = new(2026, 11, 12, 8, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void CheckIn_WhenRegistered_SetsCheckedInStatusAndTimestamp()
    {
        var participation = new Participation { Status = ParticipationStatus.Registered };

        participation.CheckIn(Now);

        Assert.Equal(ParticipationStatus.CheckedIn, participation.Status);
        Assert.Equal(Now, participation.CheckedInAt);
    }

    [Theory]
    [InlineData(ParticipationStatus.CheckedIn)]
    [InlineData(ParticipationStatus.Verified)]
    [InlineData(ParticipationStatus.Rejected)]
    public void CheckIn_WhenAlreadyProcessed_ThrowsConflict(ParticipationStatus status)
    {
        var participation = new Participation { Status = status };

        Assert.Throws<ConflictException>(() => participation.CheckIn(Now));
    }

    [Fact]
    public void Verify_WithApprove_SetsVerified()
    {
        var participation = new Participation { Status = ParticipationStatus.CheckedIn };

        participation.Verify(verifierId: 7, approve: true, Now);

        Assert.Equal(ParticipationStatus.Verified, participation.Status);
        Assert.Equal(7, participation.VerifiedById);
        Assert.Equal(Now, participation.VerifiedAt);
    }

    [Fact]
    public void Verify_WithReject_SetsRejected()
    {
        var participation = new Participation { Status = ParticipationStatus.CheckedIn };

        participation.Verify(verifierId: 7, approve: false, Now);

        Assert.Equal(ParticipationStatus.Rejected, participation.Status);
    }

    [Fact]
    public void Verify_WhenNotCheckedIn_ThrowsConflict()
    {
        var participation = new Participation { Status = ParticipationStatus.Registered };

        Assert.Throws<ConflictException>(() => participation.Verify(7, true, Now));
    }
}

public class ActivityTests
{
    private static Activity BuildActivity() => new()
    {
        Id = 3,
        CheckInCode = "demo-ctxh-2026",
        StartAt = new DateTime(2026, 11, 12, 8, 0, 0, DateTimeKind.Utc),
        EndAt = new DateTime(2026, 11, 12, 11, 0, 0, DateTimeKind.Utc),
    };

    [Fact]
    public void BuildQrPayload_UsesCtxhFormat()
    {
        Assert.Equal("ctxh:3:demo-ctxh-2026", BuildActivity().BuildQrPayload());
    }

    [Theory]
    [InlineData(7, 30, true)]   // đúng 30 phút trước giờ bắt đầu
    [InlineData(7, 29, false)]  // sớm hơn cửa sổ điểm danh
    [InlineData(9, 0, true)]    // trong thời gian diễn ra
    [InlineData(11, 0, true)]   // đúng giờ kết thúc
    [InlineData(11, 1, false)]  // sau khi kết thúc
    public void IsCheckInOpen_RespectsWindow(int hour, int minute, bool expected)
    {
        var now = new DateTime(2026, 11, 12, hour, minute, 0, DateTimeKind.Utc);

        Assert.Equal(expected, BuildActivity().IsCheckInOpen(now));
    }
}
