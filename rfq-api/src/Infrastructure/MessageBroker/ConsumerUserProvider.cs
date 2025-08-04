using Application.Common.Interfaces;
using Application.Identity;

namespace Infrastructure.MessageBroker
{
    public class ConsumerUserProvider : ICurrentUserService
    {
        private readonly IIdentityContextAccessor _identityContextAccessor;

        public ConsumerUserProvider(IIdentityContextAccessor identityContextAccessor)
        {
            _identityContextAccessor = identityContextAccessor;
        }
        public int? UserId
        {
            get
            {
                return _identityContextAccessor.IdentityContext?.CurrentUser?.Id;
            }
        }
        public string? UserRole
        {
            get
            {
                return _identityContextAccessor.IdentityContext?.CurrentUser?.Role;
            }
        }
    }
}
