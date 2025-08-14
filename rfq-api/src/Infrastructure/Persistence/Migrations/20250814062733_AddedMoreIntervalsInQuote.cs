using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddedMoreIntervalsInQuote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaximumTimelineDuration",
                table: "SubmissionQuote",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinimumTimelineDuration",
                table: "SubmissionQuote",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimelineIntervalType",
                table: "SubmissionQuote",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarantyDuration",
                table: "SubmissionQuote",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarantyIntervalType",
                table: "SubmissionQuote",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaximumTimelineDuration",
                table: "SubmissionQuote");

            migrationBuilder.DropColumn(
                name: "MinimumTimelineDuration",
                table: "SubmissionQuote");

            migrationBuilder.DropColumn(
                name: "TimelineIntervalType",
                table: "SubmissionQuote");

            migrationBuilder.DropColumn(
                name: "WarantyDuration",
                table: "SubmissionQuote");

            migrationBuilder.DropColumn(
                name: "WarantyIntervalType",
                table: "SubmissionQuote");
        }
    }
}
