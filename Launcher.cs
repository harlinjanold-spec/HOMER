using System;
using System.IO;
using System.Diagnostics;
using System.Drawing;
using System.Threading;
using System.Windows.Forms;
using System.Net.Sockets;

namespace WardZero
{
    public class LauncherForm : Form
    {
        private Label lblHeader;
        private Label lblSubheader;
        private Label lblStatusBanner;

        private Panel panelBackend;
        private Label lblDotBackend;
        private Label lblTitleBackend;
        private Label lblUrlBackend;

        private Panel panelSim;
        private Label lblDotSim;
        private Label lblTitleSim;
        private Label lblUrlSim;

        private Panel panelCC;
        private Label lblDotCC;
        private Label lblTitleCC;
        private Label lblUrlCC;

        private Button btnOpenBoth;
        private Button btnOpenSplit;
        private Button btnOpenSim;
        private Button btnOpenCC;
        private Button btnStopExit;

        private NotifyIcon trayIcon;
        private ContextMenuStrip trayMenu;

        private Process procBackend = null;
        private Process procSim = null;
        private Process procCC = null;

        private System.Windows.Forms.Timer pollTimer;
        private bool hasAutoOpened = false;
        private string baseDir;
        private string pythonExe;
        private string viteCmd;

        public LauncherForm()
        {
            InitPaths();
            InitComponents();
            StartServices();
        }

        private void InitPaths()
        {
            baseDir = AppDomain.CurrentDomain.BaseDirectory;
            if (!Directory.Exists(Path.Combine(baseDir, "apps\\home-simulator")))
            {
                // Fallback to D:\HOMER if running from outside
                if (Directory.Exists(@"D:\HOMER\apps\home-simulator"))
                {
                    baseDir = @"D:\HOMER";
                }
            }

            pythonExe = Path.Combine(baseDir, @"backend\.venv\Scripts\python.exe");
            if (!File.Exists(pythonExe))
            {
                pythonExe = "python.exe";
            }

            viteCmd = Path.Combine(baseDir, @"node_modules\.bin\vite.cmd");
            if (!File.Exists(viteCmd))
            {
                viteCmd = "npx.cmd";
            }
        }

        private void InitComponents()
        {
            this.Text = "Ward Zero • Medical Command & Simulation Platform";
            this.Size = new Size(640, 520);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(35, 44, 55);
            this.ForeColor = Color.FromArgb(241, 245, 249);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular);

            // Icon
            string icoPath = Path.Combine(baseDir, "wardzero.ico");
            if (File.Exists(icoPath))
            {
                try
                {
                    this.Icon = new Icon(icoPath);
                }
                catch { }
            }

            // Top Header Panel
            Panel topPanel = new Panel();
            topPanel.Dock = DockStyle.Top;
            topPanel.Height = 85;
            topPanel.BackColor = Color.FromArgb(26, 34, 44);
            topPanel.Padding = new Padding(18, 12, 18, 10);
            this.Controls.Add(topPanel);

            lblHeader = new Label();
            lblHeader.Text = "WARD ZERO HEALTHCARE PLATFORM";
            lblHeader.Font = new Font("Segoe UI", 13.5F, FontStyle.Bold);
            lblHeader.ForeColor = Color.FromArgb(56, 189, 248);
            lblHeader.AutoSize = true;
            lblHeader.Location = new Point(16, 12);
            topPanel.Controls.Add(lblHeader);

            lblSubheader = new Label();
            lblSubheader.Text = "Operation Homer • Simultaneous Dual-App Telemetry & Simulation Runtime";
            lblSubheader.Font = new Font("Segoe UI", 8.5F, FontStyle.Regular);
            lblSubheader.ForeColor = Color.FromArgb(148, 163, 184);
            lblSubheader.AutoSize = true;
            lblSubheader.Location = new Point(17, 37);
            topPanel.Controls.Add(lblSubheader);

            lblStatusBanner = new Label();
            lblStatusBanner.Text = "STATUS: INITIALIZING SERVICES...";
            lblStatusBanner.Font = new Font("Segoe UI", 8.5F, FontStyle.Bold);
            lblStatusBanner.ForeColor = Color.FromArgb(250, 204, 21);
            lblStatusBanner.AutoSize = true;
            lblStatusBanner.Location = new Point(17, 58);
            topPanel.Controls.Add(lblStatusBanner);

            // Services Status Container
            int topOffset = 100;

            // 1. Home Simulator Card
            panelSim = CreateServiceCard("🏠 Home Simulator (App 1)", "http://localhost:5173", "Interactive 3D Smart Apartment • Biometrics Wearables • Fall Simulator", topOffset, out lblDotSim, out lblTitleSim, out lblUrlSim);
            this.Controls.Add(panelSim);
            topOffset += 62;

            // 2. Command Centre Card
            panelCC = CreateServiceCard("🏥 Healthcare Command Centre (App 2)", "http://localhost:5174", "ICU Bedside Telemetry Monitor • Live ECG/SpO2 Waves • Nurse Triage", topOffset, out lblDotCC, out lblTitleCC, out lblUrlCC);
            this.Controls.Add(panelCC);
            topOffset += 62;

            // 3. Backend Card
            panelBackend = CreateServiceCard("⚙️ Telemetry & Clinical AI Backend", "http://localhost:8000", "Bidirectional WebSocket Hub • Patient Digital Twin • Risk Engine", topOffset, out lblDotBackend, out lblTitleBackend, out lblUrlBackend);
            this.Controls.Add(panelBackend);
            topOffset += 78;

            // Action Buttons
            // Button 1: Open Both in Browser (HERO)
            btnOpenBoth = new Button();
            btnOpenBoth.Text = "🚀  OPEN BOTH APPS (DUAL BROWSER TABS)";
            btnOpenBoth.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            btnOpenBoth.BackColor = Color.FromArgb(2, 132, 199);
            btnOpenBoth.ForeColor = Color.White;
            btnOpenBoth.FlatStyle = FlatStyle.Flat;
            btnOpenBoth.FlatAppearance.BorderSize = 0;
            btnOpenBoth.Bounds = new Rectangle(18, topOffset, 290, 42);
            btnOpenBoth.Cursor = Cursors.Hand;
            btnOpenBoth.Click += (s, e) => OpenBothApps();
            this.Controls.Add(btnOpenBoth);

            // Button 2: Open Split Screen View
            btnOpenSplit = new Button();
            btnOpenSplit.Text = "🖥️  OPEN DUAL SCREEN (SPLIT VIEW)";
            btnOpenSplit.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            btnOpenSplit.BackColor = Color.FromArgb(79, 70, 229);
            btnOpenSplit.ForeColor = Color.White;
            btnOpenSplit.FlatStyle = FlatStyle.Flat;
            btnOpenSplit.FlatAppearance.BorderSize = 0;
            btnOpenSplit.Bounds = new Rectangle(318, topOffset, 290, 42);
            btnOpenSplit.Cursor = Cursors.Hand;
            btnOpenSplit.Click += (s, e) => OpenSplitView();
            this.Controls.Add(btnOpenSplit);

            topOffset += 50;

            // Button 3: Simulator Only
            btnOpenSim = new Button();
            btnOpenSim.Text = "🏠 Open Simulator (:5173)";
            btnOpenSim.Font = new Font("Segoe UI", 8.5F, FontStyle.Bold);
            btnOpenSim.BackColor = Color.FromArgb(51, 65, 85);
            btnOpenSim.ForeColor = Color.FromArgb(241, 245, 249);
            btnOpenSim.FlatStyle = FlatStyle.Flat;
            btnOpenSim.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnOpenSim.Bounds = new Rectangle(18, topOffset, 190, 34);
            btnOpenSim.Cursor = Cursors.Hand;
            btnOpenSim.Click += (s, e) => OpenUrl("http://localhost:5173");
            this.Controls.Add(btnOpenSim);

            // Button 4: Command Centre Only
            btnOpenCC = new Button();
            btnOpenCC.Text = "🏥 Open Command Centre (:5174)";
            btnOpenCC.Font = new Font("Segoe UI", 8.5F, FontStyle.Bold);
            btnOpenCC.BackColor = Color.FromArgb(51, 65, 85);
            btnOpenCC.ForeColor = Color.FromArgb(241, 245, 249);
            btnOpenCC.FlatStyle = FlatStyle.Flat;
            btnOpenCC.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnOpenCC.Bounds = new Rectangle(216, topOffset, 215, 34);
            btnOpenCC.Cursor = Cursors.Hand;
            btnOpenCC.Click += (s, e) => OpenUrl("http://localhost:5174");
            this.Controls.Add(btnOpenCC);

            // Button 5: Stop All & Exit
            btnStopExit = new Button();
            btnStopExit.Text = "🛑 Stop & Exit";
            btnStopExit.Font = new Font("Segoe UI", 8.5F, FontStyle.Bold);
            btnStopExit.BackColor = Color.FromArgb(159, 18, 57);
            btnStopExit.ForeColor = Color.White;
            btnStopExit.FlatStyle = FlatStyle.Flat;
            btnStopExit.FlatAppearance.BorderSize = 0;
            btnStopExit.Bounds = new Rectangle(439, topOffset, 169, 34);
            btnStopExit.Cursor = Cursors.Hand;
            btnStopExit.Click += (s, e) => ShutdownAndExit();
            this.Controls.Add(btnStopExit);

            // System Tray Menu & Icon
            trayMenu = new ContextMenuStrip();
            trayMenu.Items.Add("🚀 Open Both Apps", null, (s, e) => OpenBothApps());
            trayMenu.Items.Add("🖥️ Open Split View", null, (s, e) => OpenSplitView());
            trayMenu.Items.Add("🏠 Open Home Simulator (:5173)", null, (s, e) => OpenUrl("http://localhost:5173"));
            trayMenu.Items.Add("🏥 Open Command Centre (:5174)", null, (s, e) => OpenUrl("http://localhost:5174"));
            trayMenu.Items.Add(new ToolStripSeparator());
            trayMenu.Items.Add("Show Launcher Window", null, (s, e) => { this.Show(); this.WindowState = FormWindowState.Normal; });
            trayMenu.Items.Add("🛑 Stop All & Exit", null, (s, e) => ShutdownAndExit());

            trayIcon = new NotifyIcon();
            trayIcon.Text = "Ward Zero Healthcare Platform";
            if (this.Icon != null) trayIcon.Icon = this.Icon;
            trayIcon.ContextMenuStrip = trayMenu;
            trayIcon.Visible = true;
            trayIcon.DoubleClick += (s, e) => { this.Show(); this.WindowState = FormWindowState.Normal; };

            this.FormClosing += (s, e) =>
            {
                if (e.CloseReason == CloseReason.UserClosing)
                {
                    DialogResult res = MessageBox.Show(
                        "Do you want to stop all background healthcare services and exit?\n\nClick 'Yes' to stop all services.\nClick 'No' to keep services running and minimize to System Tray.",
                        "Ward Zero Platform",
                        MessageBoxButtons.YesNoCancel,
                        MessageBoxIcon.Question
                    );

                    if (res == DialogResult.Yes)
                    {
                        ShutdownAndExit();
                    }
                    else if (res == DialogResult.No)
                    {
                        e.Cancel = true;
                        this.Hide();
                        trayIcon.ShowBalloonTip(2000, "Ward Zero Running", "Services are running in background. Double click icon to restore.", ToolTipIcon.Info);
                    }
                    else
                    {
                        e.Cancel = true;
                    }
                }
                else
                {
                    ShutdownProcesses();
                }
            };

            // Health Poll Timer (every 600ms)
            pollTimer = new System.Windows.Forms.Timer();
            pollTimer.Interval = 600;
            pollTimer.Tick += (s, e) => CheckHealthAndAutoOpen();
            pollTimer.Start();
        }

        private Panel CreateServiceCard(string title, string url, string desc, int top, out Label dot, out Label lblT, out Label lblU)
        {
            Panel card = new Panel();
            card.Bounds = new Rectangle(18, top, 590, 54);
            card.BackColor = Color.FromArgb(43, 54, 68);
            card.BorderStyle = BorderStyle.FixedSingle;

            dot = new Label();
            dot.Text = "⏳";
            dot.Font = new Font("Segoe UI", 11F);
            dot.Location = new Point(10, 16);
            dot.Size = new Size(26, 24);
            card.Controls.Add(dot);

            lblT = new Label();
            lblT.Text = title;
            lblT.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblT.ForeColor = Color.White;
            lblT.Location = new Point(38, 8);
            lblT.AutoSize = true;
            card.Controls.Add(lblT);

            Label lblDesc = new Label();
            lblDesc.Text = desc;
            lblDesc.Font = new Font("Segoe UI", 8F);
            lblDesc.ForeColor = Color.FromArgb(148, 163, 184);
            lblDesc.Location = new Point(39, 28);
            lblDesc.AutoSize = true;
            card.Controls.Add(lblDesc);

            lblU = new Label();
            lblU.Text = url;
            lblU.Font = new Font("Consolas", 8.5F, FontStyle.Bold);
            lblU.ForeColor = Color.FromArgb(56, 189, 248);
            lblU.Location = new Point(460, 18);
            lblU.AutoSize = true;
            lblU.Cursor = Cursors.Hand;
            string targetUrl = url;
            lblU.Click += (s, e) => OpenUrl(targetUrl);
            card.Controls.Add(lblU);

            return card;
        }

        private void StartServices()
        {
            // 1. Check & start Backend (port 8000)
            if (!IsPortOpen("127.0.0.1", 8000))
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = pythonExe;
                    psi.Arguments = "-m uvicorn backend.main:app --host 0.0.0.0 --port 8000";
                    psi.WorkingDirectory = baseDir;
                    psi.UseShellExecute = false;
                    psi.CreateNoWindow = true;
                    psi.WindowStyle = ProcessWindowStyle.Hidden;
                    procBackend = Process.Start(psi);
                }
                catch { }
            }

            // 2. Check & start Home Simulator (port 5173)
            if (!IsPortOpen("127.0.0.1", 5173))
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    if (viteCmd.EndsWith(".cmd", StringComparison.OrdinalIgnoreCase))
                    {
                        psi.FileName = viteCmd;
                        psi.Arguments = "--port 5173 --host";
                    }
                    else
                    {
                        psi.FileName = "cmd.exe";
                        psi.Arguments = "/c npx vite --port 5173 --host";
                    }
                    psi.WorkingDirectory = Path.Combine(baseDir, @"apps\home-simulator");
                    psi.UseShellExecute = false;
                    psi.CreateNoWindow = true;
                    psi.WindowStyle = ProcessWindowStyle.Hidden;
                    procSim = Process.Start(psi);
                }
                catch { }
            }

            // 3. Check & start Command Centre (port 5174)
            if (!IsPortOpen("127.0.0.1", 5174))
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    if (viteCmd.EndsWith(".cmd", StringComparison.OrdinalIgnoreCase))
                    {
                        psi.FileName = viteCmd;
                        psi.Arguments = "--port 5174 --host";
                    }
                    else
                    {
                        psi.FileName = "cmd.exe";
                        psi.Arguments = "/c npx vite --port 5174 --host";
                    }
                    psi.WorkingDirectory = Path.Combine(baseDir, @"apps\healthcare-command-centre");
                    psi.UseShellExecute = false;
                    psi.CreateNoWindow = true;
                    psi.WindowStyle = ProcessWindowStyle.Hidden;
                    procCC = Process.Start(psi);
                }
                catch { }
            }
        }

        private void CheckHealthAndAutoOpen()
        {
            bool beUp = IsPortOpen("127.0.0.1", 8000);
            bool simUp = IsPortOpen("127.0.0.1", 5173);
            bool ccUp = IsPortOpen("127.0.0.1", 5174);

            // Update Backend Card
            if (beUp)
            {
                lblDotBackend.Text = "🟢";
                lblDotBackend.ForeColor = Color.FromArgb(0, 255, 68);
            }
            else
            {
                lblDotBackend.Text = "⏳";
                lblDotBackend.ForeColor = Color.FromArgb(250, 204, 21);
            }

            // Update Simulator Card
            if (simUp)
            {
                lblDotSim.Text = "🟢";
                lblDotSim.ForeColor = Color.FromArgb(0, 255, 68);
            }
            else
            {
                lblDotSim.Text = "⏳";
                lblDotSim.ForeColor = Color.FromArgb(250, 204, 21);
            }

            // Update Command Centre Card
            if (ccUp)
            {
                lblDotCC.Text = "🟢";
                lblDotCC.ForeColor = Color.FromArgb(0, 255, 68);
            }
            else
            {
                lblDotCC.Text = "⏳";
                lblDotCC.ForeColor = Color.FromArgb(250, 204, 21);
            }

            if (beUp && simUp && ccUp)
            {
                lblStatusBanner.Text = "STATUS: ALL SYSTEMS ONLINE (3/3 ACTIVE) 🟢";
                lblStatusBanner.ForeColor = Color.FromArgb(0, 255, 68);

                // Auto-open both apps exactly once upon initial successful readiness!
                if (!hasAutoOpened)
                {
                    hasAutoOpened = true;
                    OpenBothApps();
                }
            }
            else
            {
                lblStatusBanner.Text = string.Format("STATUS: WAITING FOR SERVICES (Backend: {0}, Sim: {1}, Command: {2})...",
                    beUp ? "ONLINE" : "BOOTING",
                    simUp ? "ONLINE" : "BOOTING",
                    ccUp ? "ONLINE" : "BOOTING"
                );
                lblStatusBanner.ForeColor = Color.FromArgb(250, 204, 21);
            }
        }

        private void OpenBothApps()
        {
            try
            {
                Process.Start("http://localhost:5173");
                Thread.Sleep(300);
                Process.Start("http://localhost:5174");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not launch default browser: " + ex.Message, "Ward Zero", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void OpenSplitView()
        {
            try
            {
                string splitPath = Path.Combine(baseDir, "split_view.html");
                if (File.Exists(splitPath))
                {
                    Process.Start(splitPath);
                }
                else
                {
                    OpenBothApps();
                }
            }
            catch
            {
                OpenBothApps();
            }
        }

        private void OpenUrl(string url)
        {
            try
            {
                Process.Start(url);
            }
            catch { }
        }

        private bool IsPortOpen(string host, int port)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    IAsyncResult ar = client.BeginConnect(host, port, null, null);
                    bool success = ar.AsyncWaitHandle.WaitOne(300);
                    if (!success) return false;
                    client.EndConnect(ar);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        private void ShutdownProcesses()
        {
            if (pollTimer != null) pollTimer.Stop();

            try
            {
                if (procBackend != null && !procBackend.HasExited)
                {
                    procBackend.Kill();
                }
            }
            catch { }

            try
            {
                if (procSim != null && !procSim.HasExited)
                {
                    procSim.Kill();
                }
            }
            catch { }

            try
            {
                if (procCC != null && !procCC.HasExited)
                {
                    procCC.Kill();
                }
            }
            catch { }
        }

        private void ShutdownAndExit()
        {
            ShutdownProcesses();
            if (trayIcon != null)
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }
            Application.Exit();
            Environment.Exit(0);
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new LauncherForm());
        }
    }
}

