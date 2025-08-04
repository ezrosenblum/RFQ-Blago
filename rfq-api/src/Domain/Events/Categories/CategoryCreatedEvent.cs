using Domain.Entities.Categories;

namespace Domain.Events.Categories;

public sealed class CategoryCreatedEvent : BaseEvent
{
    public CategoryCreatedEvent(Category category)
    {
        Category = category;
    }

    public Category Category { get; }
}
