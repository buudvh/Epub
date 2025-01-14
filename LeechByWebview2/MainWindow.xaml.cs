using LeechByWebview2.Properties;
using Microsoft.Web.WebView2.Core;
using System.IO;
using System.Windows;
using System.Windows.Forms;

namespace LeechByWebview2
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private NotifyIcon notifyIcon;
        public MainWindow()
        {
            InitializeComponent();
            InitializeNotifyIcon();
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            await WebView.EnsureCoreWebView2Async();
            WebView.CoreWebView2.NavigationCompleted += CoreWebView2_NavigationCompleted;
            WebView.Source = new Uri(Settings.Default.URL);
        }

        private async void CoreWebView2_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
        {
            if (e.IsSuccess)
            {
                WebView.CoreWebView2.OpenDevToolsWindow();
                await WaitForSpinnerToDisappear();
            }
            else
            {
                ShowNotification($"Error when navigate to page");
            }
        }

        private async Task WaitForSpinnerToDisappear()
        {
            bool spinnerExists = true;

            while (spinnerExists)
            {
                string active = "$('#content-container > center').click();";
                await WebView.CoreWebView2.ExecuteScriptAsync(active);
                string script = "$('.spinner-border').length === 0";
                string result = await WebView.CoreWebView2.ExecuteScriptAsync(script);

                spinnerExists = !bool.Parse(result);

                if (spinnerExists)
                {
                    await Task.Delay(500);
                }
            }

            await DownloadHtmlContent();
        }

        private async Task DownloadHtmlContent()
        {
            try
            {
                string htmlContent = await WebView.CoreWebView2.ExecuteScriptAsync("document.getElementById(\"content-container\").textContent");

                htmlContent = System.Text.Json.JsonSerializer.Deserialize<string>(htmlContent);

                string filePath = Path.Combine(Settings.Default.OutputPath, $"DownloadedPage_{DateTime.Now:yyyyMMddhhmmss}.txt");

                if(!Directory.Exists(Settings.Default.OutputPath))
                {
                    Directory.CreateDirectory(Settings.Default.OutputPath);
                }

                File.WriteAllText(filePath, htmlContent);

                ShowNotification($"$Save file in { filePath}");
            }
            catch (Exception ex)
            {
                ShowNotification($"Error when download {ex.Message}");
            }
        }

        private void ShowNotification(string msg)
        {
            notifyIcon.BalloonTipTitle = "Thông báo";
            notifyIcon.BalloonTipText = msg;
            notifyIcon.ShowBalloonTip(3000);
        }

        private void InitializeNotifyIcon()
        {
            notifyIcon = new NotifyIcon
            {
                Icon = SystemIcons.Information, // Biểu tượng hiển thị
                Visible = true,
                BalloonTipIcon = ToolTipIcon.Info,
                BalloonTipTitle = "Thông báo",
                BalloonTipText = "Ứng dụng của bạn đang chạy!"
            };

            notifyIcon.ShowBalloonTip(3000);
        }

        protected override void OnClosed(EventArgs e)
        {
            base.OnClosed(e);
            notifyIcon.Dispose();
        }
    }
}