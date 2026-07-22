// 🎨 PAGE : Analytics globale Coach
// Affiche les stats agrégées de tous les adhérents

export default function AnalyticsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Vue globale de vos adhérents</p>
      </div>
      {/* TODO 🎨 : Charts recharts — WeightChart, ActivityChart, MacroChart */}
      <div className="empty-state">
        <div style={{ fontSize: '48px' }}>📊</div>
        <h3>Analytics en construction</h3>
        <p>Les graphiques de suivi global seront ici.</p>
      </div>
    </div>
  )
}
