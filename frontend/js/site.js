function SelectAll(select) {
    $('.checkboxTable').each(function () {
        $(this).prop('checked', select);
    });
}

$(function () {
    $("#allTables").on('click', function () {
        let connectionString = $('input[name="ConnectionString"]').val();
        let selectedDbType = $('#DbType').val();

        if (connectionString === "") {
            alert("Informe a string de conexão");
            return;
        }

        $.ajax({
            url: `/PocoClass/AllTables?connectionString=${ connectionString }&dbType=${ selectedDbType }`,
            type: 'GET',
            success: function (result) {
                $(".listTable").html(result);
            },
            error: function (xhr, status, error) {
                console.error("Erro ao carregar a lista: " + error);
            }
        });
    });
});
