using Domain.Entities.Medias;
using Domain.Entities.RefreshTokens;
using Domain.Entities.Submissions;
using Domain.Entities.Users;
using Domain.Entities.Users.CompanyDetails;
using Domain.Entities.Users.Providers;
using Domain.Events;
using Domain.Events.Users;
using Domain.Interfaces;
using DTO.Enums.Media;
using DTO.Enums.User;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.User
{
    public class ApplicationUser : IdentityUser<int>, IHasDomainEvents, IWithMedia
    {
        #region Domain events

        private readonly List<BaseEvent> _domainEvents = new();
        [NotMapped]
        public IReadOnlyCollection<BaseEvent> DomainEvents => _domainEvents.AsReadOnly();

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }

        public void AddDomainEvent(BaseEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void RemoveDomainEvent(BaseEvent domainEvent)
        {
            _domainEvents.Remove(domainEvent);
        }

        #endregion

        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public DateTime? LastLoginDate { get; set; }
        public DateTime Created { get; set; }
        public UserStatus Status { get; set; }
        public Guid Uid { get; private set; }
        public Media Media { get; set; } = null!;
        public string? PasswordResetToken { get; private set; }
        public string? EmailVerificationToken { get; private set; }
        public string? SuspensionReason { get; private set; }

        public virtual UserCompanyDetails? CompanyDetails { get; private set; }

        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

        public static ApplicationUser Create(
            IUserInsertData data,
            IDateTime dateTimeProvider,
            bool autoVerify = false)
        {
            var user = new ApplicationUser
            {
                FirstName = data.FirstName,
                LastName = data.LastName,
                Email = data.Email.ToLower(),
                UserName = data.Email.ToLower(),
                Created = dateTimeProvider.Now,
                Uid = Guid.NewGuid(),
                Media = new Media(MediaEntityType.User),
                PhoneNumber = data.PhoneNumber,
                Status = UserStatus.AwaitingConfirmation,
                EmailConfirmed = false
            };

            user.AddDomainEvent(new UserCreatedEvent(user));

            if (autoVerify)
            {
                user.SetEmailCofirmed();
            }

            return user;
        }

        public void Update(IUserUpdateData data)
        {
            FirstName = data.FirstName;
            LastName = data.LastName;
            Email = data.Email.ToLower();
            UserName = data.Email.ToLower();
            PhoneNumber = data.PhoneNumber;

            AddDomainEvent(new UserUpdatedEvent(this));
        }

        public void UpdateCustomer(IUserUpdateCustomerData data)
        {
            FirstName = data.FirstName;
            LastName = data.LastName;
            PhoneNumber = data.PhoneNumber;

            AddDomainEvent(new UserUpdatedEvent(this));
        }

        public void SetEmailConfirmed()
        {
            SetEmailCofirmed();
            AddDomainEvent(new UserEmailConfirmedEvent(this));
            AddDomainEvent(new UserUpdatedEvent(this));
        }
        public void Suspend(string reason)
        {
            Status = UserStatus.Suspended;
            SuspensionReason = reason;
            AddDomainEvent(new UserSuspendedEvent(this));
            AddDomainEvent(new UserUpdatedEvent(this));
        }
        public void RemoveSuspension()
        {
            Status = UserStatus.Active;
            SuspensionReason = null;
            AddDomainEvent(new UserSuspensionRemovedEvent(this));
            AddDomainEvent(new UserUpdatedEvent(this));
        }
        public void Activate()
        {
            Status = UserStatus.Active;
            AddDomainEvent(new UserActivatedEvent(this));
            AddDomainEvent(new UserUpdatedEvent(this));
        }
        public void Deactivate()
        {
            Status = UserStatus.Deactivated;
            AddDomainEvent(new UserDeactivatedEvent(this));
            AddDomainEvent(new UserUpdatedEvent(this));
        }
        public void Delete()
        {
            Status = UserStatus.Deleted;
            AddDomainEvent(new UserDeletedEvent(this));
            AddDomainEvent(new UserUpdatedEvent(this));
        }
        public void UpdatePassword(string oldPassword, string ipAddress)
        {
            AddDomainEvent(new PasswordChangedEvent(this, oldPassword, ipAddress));
            PasswordResetToken = null;
        }

        public async Task SetProfilePicture(IMediaUpsertData data, IMediaStorage mediaStorage)
        {
            await RemoveProfilePicture(mediaStorage, false);
            await Media.Save(data, Id, mediaStorage);
            AddDomainEvent(new UserUpdatedEvent(this));
        }

        public async Task RemoveProfilePicture(IMediaStorage mediaStorage, bool raiseEvent = true)
        {
            var existedPhoto = Media.GetMainOrFirstImage();

            if (existedPhoto != null)
            {
                await Media.Delete(existedPhoto.Id, Id, mediaStorage);

                if (raiseEvent)
                {
                    AddDomainEvent(new UserUpdatedEvent(this));
                }
            }
        }

        private void SetEmailCofirmed()
        {
            EmailConfirmed = true;
            Status = UserStatus.Active;
        }

        public async Task GenereatePasswordResetCode(IAuthCodeProvider codeProvider)
        {
            PasswordResetToken = await codeProvider.GenereatePasswordResetCode(this);
        }

        public void SetEmailVerificationToken(string token)
        {
            EmailVerificationToken = token;
        }

        public void SetCompany(UserCompanyDetails company)
        {
            CompanyDetails = company;
        }
    }
}
