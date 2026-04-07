import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { financialReportService, DateRange } from '@/services/financialReportService';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ActivityPLItem {
  activity: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface PotentialVsActual {
  potentialRevenue: number;
  actualRevenue: number;
  outstanding: number;
  collectionRate: number;
}

interface Props {
  dateRange: DateRange;
}

const ActivityProfitLoss: React.FC<Props> = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityPLItem[]>([]);
  const [potentialVsActual, setPotentialVsActual] = useState<PotentialVsActual | null>(null);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activityPL, pva] = await Promise.all([
        financialReportService.generateActivityProfitLoss(dateRange),
        financialReportService.generatePotentialVsActual(dateRange),
      ]);
      setActivityData(activityPL);
      setPotentialVsActual(pva);
    } catch (error) {
      console.error('Error loading Activity P&L:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExportCSV = () => {
    const headers = ['Activity', 'Revenue (KES)', 'Expenses (KES)', 'Net Profit (KES)'];
    const rows = activityData.map(item => [
      item.activity,
      item.revenue.toFixed(2),
      item.expenses.toFixed(2),
      item.netProfit.toFixed(2),
    ]);
    if (potentialVsActual) {
      rows.push([]);
      rows.push(['POTENTIAL VS ACTUAL']);
      rows.push(['Potential Revenue', potentialVsActual.potentialRevenue.toFixed(2)]);
      rows.push(['Actual Revenue', potentialVsActual.actualRevenue.toFixed(2)]);
      rows.push(['Outstanding', potentialVsActual.outstanding.toFixed(2)]);
      rows.push(['Collection Rate', `${potentialVsActual.collectionRate.toFixed(1)}%`]);
    }
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `activity-pl-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Activity Profit & Loss', 14, 20);
    doc.setFontSize(10);
    doc.text(`Period: ${format(dateRange.startDate, 'dd MMM yyyy')} - ${format(dateRange.endDate, 'dd MMM yyyy')}`, 14, 28);

    autoTable(doc, {
      head: [['Activity', 'Revenue', 'Expenses', 'Net Profit']],
      body: activityData.map(item => [
        item.activity,
        item.revenue.toLocaleString(),
        item.expenses.toLocaleString(),
        item.netProfit.toLocaleString(),
      ]),
      startY: 35,
      headStyles: { fillColor: [34, 139, 34] },
    });

    if (potentialVsActual) {
      autoTable(doc, {
        head: [['Metric', 'Amount']],
        body: [
          ['Potential Revenue', potentialVsActual.potentialRevenue.toLocaleString()],
          ['Actual Revenue', potentialVsActual.actualRevenue.toLocaleString()],
          ['Outstanding', potentialVsActual.outstanding.toLocaleString()],
          ['Collection Rate', `${potentialVsActual.collectionRate.toFixed(1)}%`],
        ],
        startY: (doc as any).lastAutoTable.finalY + 10,
        headStyles: { fillColor: [0, 123, 255] },
      });
    }

    doc.save(`activity-pl-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px]" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const totalRevenue = activityData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = activityData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Activity Profit & Loss</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {format(dateRange.startDate, 'dd MMM')} - {format(dateRange.endDate, 'dd MMM yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {/* Potential vs Actual Summary */}
      {potentialVsActual && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Potential Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(potentialVsActual.potentialRevenue)}</div>
              <p className="text-xs text-muted-foreground">If all registrations paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Actual Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(potentialVsActual.actualRevenue)}</div>
              <p className="text-xs text-muted-foreground">Current amount in accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-destructive">{formatCurrency(potentialVsActual.outstanding)}</div>
              <p className="text-xs text-muted-foreground">Still to be collected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{potentialVsActual.collectionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Of total potential</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity P&L Chart */}
      {activityData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue vs Expenses by Activity</CardTitle>
              <CardDescription>Per-activity financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="activity"
                      width={120}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Breakdown</CardTitle>
              <CardDescription>Detailed profit and loss per activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Activity</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Revenue</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Expenses</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Net Profit</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityData.map((item) => (
                      <tr key={item.activity} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">{item.activity}</td>
                        <td className="py-2 px-3 text-right text-primary">{formatCurrency(item.revenue)}</td>
                        <td className="py-2 px-3 text-right text-destructive">{formatCurrency(item.expenses)}</td>
                        <td className={`py-2 px-3 text-right font-medium ${item.netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {formatCurrency(item.netProfit)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant={item.netProfit >= 0 ? 'default' : 'destructive'} className="text-xs">
                            {item.netProfit >= 0 ? 'Profit' : 'Loss'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border font-bold">
                      <td className="py-2 px-3">Total</td>
                      <td className="py-2 px-3 text-right text-primary">{formatCurrency(totalRevenue)}</td>
                      <td className="py-2 px-3 text-right text-destructive">{formatCurrency(totalExpenses)}</td>
                      <td className={`py-2 px-3 text-right ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(totalProfit)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={totalProfit >= 0 ? 'default' : 'destructive'}>
                          {totalProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No activity data available for the selected period
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityProfitLoss;
