using Application.Common.Search;
using Application.Features.Submissions.Search;

namespace Infrastructure.Search;

public class SearchIndexProvider : ISearchIndexProvider
{
    public string GetIndex<T>() where T : ISearchable
    {
        return typeof(T) switch
        {
            _ when typeof(T) == typeof(SubmissionSearchable) => SearchIndex.Submission,
            _ => SearchIndex.Default
        };
    }
}
