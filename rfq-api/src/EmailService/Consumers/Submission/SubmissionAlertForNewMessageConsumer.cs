using DTO.MessageBroker.Messages.Submission;
using EmailService.Models;
using EmailService.Services.Interfaces;
using MassTransit;

namespace EmailService.Consumers.Submission;

public sealed class SubmissionAlertForNewMessageConsumer : IConsumer<SubmissionAlertForNewMessage>
{
    private readonly ILogger<SubmissionAlertForNewMessageConsumer> _logger;
    private readonly IEmailSender _emailSender;
    private readonly ITemplateProvider _templateProivder;

    public SubmissionAlertForNewMessageConsumer(
        ILogger<SubmissionAlertForNewMessageConsumer> logger,
        IEmailSender emailSender,
        ITemplateProvider templateProivder)
    {
        _logger = logger;
        _emailSender = emailSender;
        _templateProivder = templateProivder;
    }
    public async Task Consume(ConsumeContext<SubmissionAlertForNewMessage> context)
    {
        _logger.LogInformation("Sending alert through email for new RFQ to {email}", context.Message.Email);

        var parameters = new Dictionary<string, string>
        {
            { "@firstName", context.Message.FirstName },
            { "@lastName", context.Message.LastName },
            { "@id", context.Message.SubmissionId.ToString() }
        };

        var htmlTemplateContent = await _templateProivder.GetTemplateAsync("Submission", "NewSubmission", parameters);

        await _emailSender.SendAsync(new MailMessageRequest(
            context.Message.Email,
            "Supply Streamline - New RFQ Posted",
            htmlTemplateContent,
            $"{context.Message.FirstName} {context.Message.LastName}"));
    }
}
