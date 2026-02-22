using TaskHub.Domain.Common;
using TaskHub.Domain.Enums;
using TaskHub.Domain.Exceptions;
using TaskHub.Domain.ValueObjects;

namespace TaskHub.Domain.Entities;

public class TodoItem : AuditableEntity
{
    public Guid OrgId { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public TodoStatus Status { get; private set; }
    public Priority Priority { get; private set; }
    public List<Tag> Tags { get; private set; } = new();
    public DateTime? DueDate { get; private set; }
    public Guid? AssignedToUserId { get; private set; }
    public DateTime? AssignedAt { get; private set; }
    public int Version { get; private set; } = 1;

    // Soft delete
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    // Archive
    public bool IsArchived { get; private set; }
    public DateTime? ArchivedAt { get; private set; }

    private const int MaxTitleLength = 200;
    private const int MinTitleLength = 1;
    private const int MaxDescriptionLength = 2000;
    private const int MaxTags = 10;

    // Required by file storage deserialisation
    private TodoItem() { }

    public static TodoItem Create(
        Guid orgId,
        Guid createdByUserId,
        string title,
        string? description,
        Priority priority,
        List<Tag> tags,
        DateTime? dueDate,
        DateTime now,
        Guid? assignedToUserId = null)
    {
        ValidateTitle(title);
        ValidateDescription(description);
        ValidateTags(tags);

        var todo = new TodoItem
        {
            OrgId = orgId,
            CreatedByUserId = createdByUserId,
            Title = title.Trim(),
            Description = description?.Trim(),
            Status = TodoStatus.Open,
            Priority = priority,
            Tags = tags ?? new List<Tag>(),
            DueDate = dueDate,
            AssignedToUserId = assignedToUserId,
            AssignedAt = assignedToUserId.HasValue ? now : null
        };

        todo.SetCreated(now);
        return todo;
    }

    public void Update(
        string title,
        string? description,
        Priority priority,
        List<Tag> tags,
        DateTime? dueDate,
        DateTime now,
        Guid? assignedToUserId = null)
    {
        if (IsDeleted)
            throw new BusinessRuleException("todo.deleted", 
                "Cannot update a deleted todo.");

        if (IsArchived)
            throw new BusinessRuleException("todo.archived", 
                "Cannot update an archived todo.");

        ValidateTitle(title);
        ValidateDescription(description);
        ValidateTags(tags);

        Title = title.Trim();
        Description = description?.Trim();
        Priority = priority;
        Tags = tags ?? new List<Tag>();
        DueDate = dueDate;

        // Update assignment
        if (assignedToUserId != AssignedToUserId)
        {
            AssignedToUserId = assignedToUserId;
            AssignedAt = assignedToUserId.HasValue ? now : null;
        }

        Version++;
        SetUpdated(now);
    }

    public void ToggleStatus(DateTime now)
    {
        if (IsDeleted)
            throw new BusinessRuleException("todo.deleted", 
                "Cannot toggle status of a deleted todo.");

        if (IsArchived)
            throw new BusinessRuleException("todo.archived", 
                "Cannot toggle status of an archived todo.");

        Status = Status == TodoStatus.Open ? TodoStatus.Done : TodoStatus.Open;

        Version++;
        SetUpdated(now);
    }

    public void SoftDelete(DateTime now)
    {
        if (IsDeleted)
            throw new BusinessRuleException("todo.already_deleted", 
                "Todo is already deleted.");

        IsDeleted = true;
        DeletedAt = now;

        Version++;
        SetUpdated(now);
    }

    public void Restore(DateTime now)
    {
        if (!IsDeleted)
            throw new BusinessRuleException("todo.not_deleted", 
                "Todo is not deleted and cannot be restored.");

        IsDeleted = false;
        DeletedAt = null;

        Version++;
        SetUpdated(now);
    }

    public void Archive(DateTime now)
    {
        if (IsDeleted)
            throw new BusinessRuleException("todo.deleted", 
                "Cannot archive a deleted todo.");

        if (IsArchived)
            throw new BusinessRuleException("todo.already_archived", 
                "Todo is already archived.");

        IsArchived = true;
        ArchivedAt = now;
        Status = TodoStatus.Archived;

        Version++;
        SetUpdated(now);
    }

    public void UnArchive(DateTime now)
    {
        if (!IsArchived)
            throw new BusinessRuleException("todo.not_archived", 
                "Todo is not archived.");

        IsArchived = false;
        ArchivedAt = null;
        Status = TodoStatus.Open;

        Version++;
        SetUpdated(now);
    }

    public bool IsOverdue(DateTime now)
    {
        return DueDate.HasValue
            && DueDate.Value < now
            && Status == TodoStatus.Open
            && !IsDeleted
            && !IsArchived;
    }

    // Private validation helpers
    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ValidationException("title", "Title cannot be empty.");

        if (title.Length < MinTitleLength)
            throw new ValidationException("title",
                $"Title must be at least {MinTitleLength} character.");

        if (title.Length > MaxTitleLength)
            throw new ValidationException("title",
                $"Title cannot exceed {MaxTitleLength} characters.");
    }

    private static void ValidateDescription(string? description)
    {
        if (description != null && description.Length > MaxDescriptionLength)
            throw new ValidationException("description",
                $"Description cannot exceed {MaxDescriptionLength} characters.");
    }

    private static void ValidateTags(List<Tag> tags)
    {
        if (tags != null && tags.Count > MaxTags)
            throw new ValidationException("tags",
                $"Cannot have more than {MaxTags} tags.");
    }
}