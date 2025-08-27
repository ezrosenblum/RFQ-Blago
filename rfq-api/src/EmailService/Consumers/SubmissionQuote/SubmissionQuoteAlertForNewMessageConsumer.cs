using DTO.MessageBroker.Messages.Submission.SubmissionQuote;
using EmailService.Models;
using EmailService.Services.Interfaces;
using MassTransit;

namespace EmailService.Consumers.Submission;

public sealed class SubmissionQuoteAlertForNewMessageConsumer : IConsumer<SubmissionQuoteAlertForNewMessage>
{
    private readonly ILogger<SubmissionQuoteAlertForNewMessageConsumer> _logger;
    private readonly IEmailSender _emailSender;
    private readonly ITemplateProvider _templateProivder;

    public SubmissionQuoteAlertForNewMessageConsumer(
        ILogger<SubmissionQuoteAlertForNewMessageConsumer> logger,
        IEmailSender emailSender,
        ITemplateProvider templateProivder)
    {
        _logger = logger;
        _emailSender = emailSender;
        _templateProivder = templateProivder;
    }
    public async Task Consume(ConsumeContext<SubmissionQuoteAlertForNewMessage> context)
    {
        _logger.LogInformation("Sending alert through email for new quote to {email}", context.Message.Email);

        var parameters = new Dictionary<string, string>
        {
            { "@firstName", context.Message.FirstName },
            { "@lastName", context.Message.LastName },
            { "@id", context.Message.SubmissionQuoteId.ToString() }
        };

        var htmlTemplateContent = await _templateProivder.GetTemplateAsync("SubmissionQuote", "NewSubmissionQuote", parameters);

        await _emailSender.SendAsync(new MailMessageRequest(
            context.Message.Email,
            "Supply Streamline - New Quote Submitted",
            htmlTemplateContent,
            $"{context.Message.FirstName} {context.Message.LastName}"));
    }
}
