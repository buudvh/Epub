using Microsoft.Web.WebView2.Core;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace LeechByWebview2
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            await WebView.EnsureCoreWebView2Async();
            WebView.CoreWebView2.NavigationCompleted += CoreWebView2_NavigationCompleted;
            WebView.Source = new Uri("https://sangtacviet.app/truyen/qidian/1/1040916474/819998168/");
        }

        private async void CoreWebView2_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
        {
            if (e.IsSuccess)
            {
                //MessageBox.Show("Trang đã tải xong, bắt đầu kiểm tra spinner...");
                await WaitForSpinnerToDisappear();
            }
            else
            {
                MessageBox.Show($"Lỗi khi tải trang. HTTP Status: {e.WebErrorStatus}");
            }
        }

        private async Task WaitForSpinnerToDisappear()
        {
            bool spinnerExists = true;

            while (spinnerExists)
            {
                // JavaScript để kiểm tra spinner
                string script = "$('.spinner-border').length === 0";
                string result = await WebView.CoreWebView2.ExecuteScriptAsync(script);

                // Convert kết quả JavaScript thành Boolean
                spinnerExists = !bool.Parse(result);

                // Nếu spinner còn tồn tại, đợi 500ms rồi kiểm tra lại
                if (spinnerExists)
                {
                    await Task.Delay(500);
                }
            }

            // Spinner đã biến mất, tải tài liệu xuống
            await DownloadHtmlContent();
        }

        private async Task DownloadHtmlContent()
        {
            try
            {
                // Lấy toàn bộ nội dung HTML của trang
                string htmlContent = await WebView.CoreWebView2.ExecuteScriptAsync("document.documentElement.outerHTML");

                // Loại bỏ dấu nháy kép ở đầu và cuối chuỗi
                htmlContent = System.Text.Json.JsonSerializer.Deserialize<string>(htmlContent);

                // Đường dẫn lưu file HTML
                string filePath = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "DownloadedPage.html");

                // Ghi nội dung HTML ra file
                File.WriteAllText(filePath, htmlContent);

            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi khi tải HTML: {ex.Message}");
            }
        }
    }
}