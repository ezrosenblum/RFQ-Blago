using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CompleteMessageEntityChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "QuoteStatus",
                table: "QuoteMessage",
                newName: "SenderId");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "QuoteMessage",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "QuoteMessageStatus",
                table: "QuoteMessage",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_QuoteMessage_SenderId",
                table: "QuoteMessage",
                column: "SenderId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuoteMessage_AspNetUsers_SenderId",
                table: "QuoteMessage",
                column: "SenderId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuoteMessage_AspNetUsers_SenderId",
                table: "QuoteMessage");

            migrationBuilder.DropIndex(
                name: "IX_QuoteMessage_SenderId",
                table: "QuoteMessage");

            migrationBuilder.DropColumn(
                name: "QuoteMessageStatus",
                table: "QuoteMessage");

            migrationBuilder.RenameColumn(
                name: "SenderId",
                table: "QuoteMessage",
                newName: "QuoteStatus");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "QuoteMessage",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
