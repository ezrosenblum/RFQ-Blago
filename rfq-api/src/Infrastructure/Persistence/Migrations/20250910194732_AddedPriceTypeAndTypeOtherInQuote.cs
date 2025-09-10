using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddedPriceTypeAndTypeOtherInQuote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PriceType",
                table: "SubmissionQuote",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PriceTypeOther",
                table: "SubmissionQuote",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PriceType",
                table: "SubmissionQuote");

            migrationBuilder.DropColumn(
                name: "PriceTypeOther",
                table: "SubmissionQuote");
        }
    }
}
