namespace TaskHub.Application.Common.Models;

public class ImportReport
{
    public int AcceptedCount { get; }
    public int RejectedCount { get; }
    public IReadOnlyList<RejectedRow> RejectedRows { get; }

    public ImportReport(int acceptedCount, List<RejectedRow> rejectedRows)
    {
        AcceptedCount = acceptedCount;
        RejectedCount = rejectedRows.Count;
        RejectedRows = rejectedRows;
    }
}

public class RejectedRow
{
    public int RowIndex { get; }
    public IReadOnlyList<string> Errors { get; }

    public RejectedRow(int rowIndex, List<string> errors)
    {
        RowIndex = rowIndex;
        Errors = errors;
    }
}