using Application.Common.Search;
using Application.Features.Notifications.Search;
using Application.Features.Submissions.Search;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;
using Application.Features.Submissions.SubmissionQuotes.Search;
using Application.Features.Users.Search;

namespace Infrastructure.Search;

public class SearchIndexProvider : ISearchIndexProvider
{
    public string GetIndex<T>() where T : ISearchable
    {
        return typeof(T) switch
        {
            _ when typeof(T) == typeof(SubmissionSearchable) => SearchIndex.Submission,
            _ when typeof(T) == typeof(SubmissionQuoteSearchable) => SearchIndex.SubmissionQuote,
            _ when typeof(T) == typeof(QuoteMessageSearchable) => SearchIndex.QuoteMessage,
            _ when typeof(T) == typeof(NotificationSearchable) => SearchIndex.Notification,
            _ when typeof(T) == typeof(UserSearchable) => SearchIndex.User,
            _ => SearchIndex.Default
        };
    }
}
