using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookQuotes.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var isSqlServer = ActiveProvider.Contains("SqlServer", StringComparison.Ordinal);
            var idType = isSqlServer ? "nvarchar(450)" : "TEXT";
            var quoteType = isSqlServer ? "nvarchar(500)" : "TEXT";
            var authorType = isSqlServer ? "nvarchar(120)" : "TEXT";
            var integerType = isSqlServer ? "int" : "INTEGER";
            var dateTimeOffsetType = isSqlServer ? "datetimeoffset" : "TEXT";

            migrationBuilder.CreateTable(
                name: "Quotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: integerType, nullable: false)
                        .Annotation("Sqlite:Autoincrement", true)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: quoteType, maxLength: 500, nullable: false),
                    Author = table.Column<string>(type: authorType, maxLength: 120, nullable: false),
                    UserId = table.Column<string>(type: idType, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: dateTimeOffsetType, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quotes_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_UserId",
                table: "Quotes",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Quotes");
        }
    }
}
