using Application.Features.Notifications.Commands;
using Application.Features.Submissions.Commands;
using Application.Features.Submissions.SubmissionQuotes.Commands;
using MediatR;
using Microsoft.Extensions.Logging;
using Persistence;

namespace Infrastructure.Search;

public static class SearchIndexInitializer
{
    public static async Task InitializeIndexes(ISender mediatr, ILogger<ApplicationDbContextInitialiser> logger)
    {
        await InitializeSubmissionIndex(mediatr, logger);
        await InitializeSubmissionQuoteIndex(mediatr, logger);
        await InitializeNotificationIndex(mediatr, logger);
    }

    private static async Task InitializeSubmissionIndex(ISender mediatr, ILogger<ApplicationDbContextInitialiser> logger)
    {
        try
        {
            logger.LogDebug("STARTED BUILDING SEARCH INDEX FOR SUBMISSION");
            await mediatr.Send(new SubmissionRebuildSearchIndexCommand());
            logger.LogDebug("FINISHED BUILDING SEARCH INDEX FOR SUBMISSION");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "ERROR WHILE BUILDING SEARCH INDEX FOR SUBMISSION");
        }
    }
    private static async Task InitializeSubmissionQuoteIndex(ISender mediatr, ILogger<ApplicationDbContextInitialiser> logger)
    {
        try
        {
            logger.LogDebug("STARTED BUILDING SEARCH INDEX FOR SUBMISSION QUOTE");
            await mediatr.Send(new SubmissionQuoteRebuildSearchIndexCommand());
            logger.LogDebug("FINISHED BUILDING SEARCH INDEX FOR SUBMISSION QUOTE");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "ERROR WHILE BUILDING SEARCH INDEX FOR SUBMISSION QUOTE");
        }
    }
    private static async Task InitializeNotificationIndex(ISender mediatr, ILogger<ApplicationDbContextInitialiser> logger)
    {
        try
        {
            logger.LogDebug("STARTED BUILDING SEARCH INDEX FOR Notification");
            await mediatr.Send(new NotificationRebuildSearchIndexCommand());
            logger.LogDebug("FINISHED BUILDING SEARCH INDEX FOR Notification");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "ERROR WHILE BUILDING SEARCH INDEX FOR Notification");
        }
    }
}
