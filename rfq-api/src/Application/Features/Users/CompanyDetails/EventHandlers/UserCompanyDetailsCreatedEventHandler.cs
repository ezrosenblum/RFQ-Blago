using Application.Common.Interfaces;
using Application.Common.Interfaces.Identity;
using Application.Common.Services;
using Application.Identity;
using Domain.Entities.Medias;
using Domain.Events.Users.CompanyDetails;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.UserCompanyDetailss.CompanyDetails.EventHandlers;

public sealed class UserCompanyDetailsCreatedEventHandler : INotificationHandler<UserCompanyDetailsCreatedEvent>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IIdentityImpersonator _identityImpersonator;
    private readonly IMediaStorage _mediaStorage;

    public UserCompanyDetailsCreatedEventHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IIdentityImpersonator identityImpersonator,
        IMediaStorage mediaStorage)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _identityImpersonator = identityImpersonator;
        _mediaStorage = mediaStorage;
    }

    public async Task Handle(UserCompanyDetailsCreatedEvent eventData, CancellationToken cancellationToken)
    {
        if (eventData.Certificate != null)
        {
            await eventData.CompanyDetails.UploadFile(new MediaCreateData(eventData.Certificate, true, 1), _mediaStorage);
        }

        _dbContext.UserCompanyDetails.Update(eventData.CompanyDetails);
        await _identityImpersonator.ImpersonateAsync("administrator@localhost", async () =>
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }, 
        cancellationToken);
    }
}
