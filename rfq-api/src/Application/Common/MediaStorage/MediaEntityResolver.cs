using Application.Common.Interfaces.Identity;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.MediaStorage.Interfaces;
using Domain.Entities.Base;
using Domain.Entities.Medias;
using Domain.Entities.Submissions;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using Domain.Entities.Users.CompanyDetails;
using DTO.Enums.Media;
using Microsoft.Extensions.DependencyInjection;

namespace Application.Common.MediaStorage;

public class MediaEntityResolver : IMediaEntityResolver
{
    private readonly IServiceProvider _serviceProvider;

    public MediaEntityResolver(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async ValueTask<IWithMedia?> GetMediaEntity(int id, MediaEntityType entityType)
    {
        IWithMedia? entity = entityType switch
        {
            MediaEntityType.User => await GetUserEntity(id),
            MediaEntityType.QuoteMessage => await GetEntity<QuoteMessage>(id),
            MediaEntityType.SubmissionQuote => await GetEntity<SubmissionQuote>(id),
            MediaEntityType.Submission => await GetEntity<Submission>(id),
            MediaEntityType.UserCompanyDetails => await GetEntity<UserCompanyDetails>(id),
            _ => throw new ArgumentOutOfRangeException()
        };

        return entity;
    }

    private async ValueTask<IWithMedia?> GetUserEntity(int id)
    {
        var _userManager = _serviceProvider.GetRequiredService<IApplicationUserManager>();
        return await _userManager.GetAsync(id);
    }

    private Task<T?> GetEntity<T>(int id)
        where T : BaseEntity, IWithMedia =>
        _serviceProvider.GetRequiredService<IRepository<T>>().GetAsync(id);
}
