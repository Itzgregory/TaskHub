namespace TaskHub.Domain.Enums;

public enum AuditAction
{
    // Auth
    LoginSuccess,
    LoginFailed,
    Logout,

    // Todo
    TodoCreated,
    TodoUpdated,
    TodoSoftDeleted,
    TodoRestored,
    TodoHardDeleted,
    TodoArchived,

    // Organisation
    OrgCreated,
    MemberAdded,
    MemberRemoved,
    RoleChanged,

    // Import/Export
    TodosImported,
    TodosExported
}