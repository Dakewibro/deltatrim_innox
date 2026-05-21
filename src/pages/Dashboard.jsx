import LeechCurveGraph from '../components/LeechCurveGraph'
import ReceiverVisualization from '../components/ReceiverVisualization'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="page-header">Live Dashboard</h1>
      <div className="dashboard-grid">
        <div className="graph-wrapper">
          <ReceiverVisualization />
        </div>
        <div className="graph-wrapper">
          <LeechCurveGraph
            title="Boat Comparison 1"
            boats={[
              { name: 'Boat 1' },
              { name: 'Boat 2' }
            ]}
            colors={['#00d4aa', '#9d4edd']}
          />
        </div>
        <div className="graph-wrapper">
          <LeechCurveGraph
            title="Boat Comparison 2"
            boats={[
              { name: 'Boat 3' },
              { name: 'Boat 4' }
            ]}
            colors={['#ff6b9d', '#4dabf7']}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard