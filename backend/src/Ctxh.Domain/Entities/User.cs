using Ctxh.Domain.Common;
using Ctxh.Domain.Enums;

namespace Ctxh.Domain.Entities;

public class User : Entity
{
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Student;

    public ICollection<Activity> CreatedActivities { get; set; } = new List<Activity>();
    public ICollection<Participation> Participations { get; set; } = new List<Participation>();
    public ICollection<Participation> VerifiedParticipations { get; set; } = new List<Participation>();
}
