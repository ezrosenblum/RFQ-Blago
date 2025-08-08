using Domain.Primitives;

namespace Domain.Entities.Submissions.StatusHistories;

public interface IWithStatusHistory
{
    List<StatusHistory> StatusHistory { get; set; }
}
