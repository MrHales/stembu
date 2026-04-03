import React, { useState, useEffect } from 'react'
import './index.css'
import SpeciesTypeSection from './components/SpeciesTypeSection'
import SpeciesTraitsSection from './components/SpeciesTraitsSection'
import TraitModal from './components/TraitModal'
import DisclaimerModal from './components/DisclaimerModal'
import AuthoritySection from './components/AuthoritySection'
import CivicsSection from './components/CivicsSection'
import GovernmentTypeSection from './components/GovernmentTypeSection'

function SectionPanel({ title, description, children }) {
  return (
    <div className="glass-panel" id={title.replace(/\s+/g, '-').toLowerCase()}>
      <h2>{title}</h2>
      {description && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{description}</p>}
      <div className="section-content">
        {children || <div className="placeholder-content">Awaiting Interface Uplink...</div>}
      </div>
    </div>
  )
}

function App() {
  const [empireName, setEmpireName] = useState("New Empire")
  const [speciesType, setSpeciesType] = useState(null)
  const [selectedTraits, setSelectedTraits] = useState([])
  const [activePopupTrait, setActivePopupTrait] = useState(null)
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [selectedCivics, setSelectedCivics] = useState([])
  const [selectedAuthority, setSelectedAuthority] = useState(null)
  
  // Hardcoded ethics for now to allow government calculation to work before we add the full Ethics UI
  const [selectedEthics, setSelectedEthics] = useState([
    { name: "Fanatic Materialist" }
  ]);

  // Scroll logic for "Back to Top" float
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true)
      } else {
        setShowTopBtn(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleNew = () => {
    alert("Initializing new empire sequence...")
    setSpeciesType(null)
    setSelectedTraits([])
    setSelectedCivics([])
    setSelectedAuthority(null)
  }

  const handleSave = () => {
    alert(`Saving matrix for [${empireName}]...`)
  }

  const handleSpeciesTypeSelect = (type) => {
    if (type !== speciesType) {
      if (
        (speciesType === 'Machine' && type !== 'Machine') ||
        (speciesType !== 'Machine' && type === 'Machine')
      ) {
        setSelectedTraits([])
      }
      setSpeciesType(type)
    }
  }

  const handleTraitToggle = (trait) => {
    setSelectedTraits(prev => {
      const isSelected = prev.some(t => t.name === trait.name)
      if (isSelected) {
        return prev.filter(t => t.name !== trait.name)
      } else {
        return [...prev, trait]
      }
    })
  }

  const handleCivicToggle = (civic) => {
    setSelectedCivics(prev => {
      const isSelected = prev.some(c => c.name === civic.name)
      if (isSelected) {
        return prev.filter(c => c.name !== civic.name)
      } else {
        if (prev.length >= 3) return prev; // max 3
        return [...prev, civic]
      }
    })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>stembu</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>STellaris EMpire BUilder</p>
        </div>
        <div className="header-actions">
          <button className="primary" onClick={handleNew}>New Empire</button>
          <button className="danger" onClick={handleSave}>Save Empire</button>
        </div>
      </header>

      {/* Summary Segment */}
      <div className="summary-segment">
        <h3>Empire Configuration Status</h3>
        <p>
          <strong className="text-accent">Species:</strong> {speciesType || 'Not Selected'}
        </p>
        <p>
          <strong className="text-accent">Traits:</strong> 
          {selectedTraits.length > 0 ? (
            selectedTraits.map(t => (
              <span 
                key={t.name} 
                className={`summary-trait-tag ${t.points < 0 ? 'negative' : ''}`}
                onClick={() => setActivePopupTrait(t)}
              >
                {t.name}
              </span>
            ))
          ) : (
            <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>None</span>
          )}
        </p>
        <p>
          <strong className="text-accent">Civics:</strong> 
          {selectedCivics.length > 0 ? (
            selectedCivics.map(c => (
              <span 
                key={c.name} 
                className="summary-trait-tag"
                onClick={() => setActivePopupTrait(c)}
              >
                {c.name}
              </span>
            ))
          ) : (
            <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>None</span>
          )}
        </p>
        <p>
          <strong className="text-accent">Authority:</strong> 
          {selectedAuthority ? (
            <span 
              className="summary-trait-tag"
              onClick={() => setActivePopupTrait({
                name: selectedAuthority.name,
                description: selectedAuthority.Description,
                effects: selectedAuthority['Empire effects'],
                requirements: selectedAuthority.Requirements
              })}
            >
              {selectedAuthority.name}
            </span>
          ) : (
            <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>None</span>
          )}
        </p>
      </div>

      <main className="empire-grid">
        <SectionPanel 
          title="Species Type" 
          description="Select your biological, cybernetic, or mechanical origins." 
        >
          <SpeciesTypeSection 
            selectedType={speciesType} 
            onSelectType={handleSpeciesTypeSelect} 
          />
        </SectionPanel>

        <SectionPanel 
           title="Species Traits" 
           description="Allocate genetic or modding points to define your species' strengths." 
        >
           <SpeciesTraitsSection 
             speciesType={speciesType} 
             selectedTraits={selectedTraits} 
             onTraitToggle={handleTraitToggle} 
             onTraitInfoClick={setActivePopupTrait}
           />
        </SectionPanel>

        <SectionPanel 
          title="Homeworld & System" 
          description="Choose your planetary preference and starting star system flavor." 
        />
        <SectionPanel 
          title="Name Lists & Flag" 
          description="Designate your cultural nomenclature and cosmic heraldry." 
        />
        <SectionPanel 
          title="Origin" 
          description="How did your civilization reach the stars?" 
        />
      </main>

      <h2 style={{ marginTop: '3rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Government Structure</h2>
      <div className="government-grid">
        <SectionPanel 
          title="Authority" 
          description="Determine your authority structure." 
        >
          <AuthoritySection 
            selectedAuthority={selectedAuthority}
            onSelectAuthority={setSelectedAuthority}
            speciesType={speciesType}
          />
        </SectionPanel>

        <SectionPanel 
          title="Civics" 
          description="Establish the core societal tenets of your empire." 
        >
          <CivicsSection 
            selectedCivics={selectedCivics}
            onCivicToggle={handleCivicToggle}
            onCivicInfoClick={setActivePopupTrait}
          />
        </SectionPanel>

        <SectionPanel 
          title="Government Type" 
          description="Calculated based on your Authority, Civics, and Ethics." 
        >
          <GovernmentTypeSection 
            selectedAuthority={selectedAuthority}
            selectedCivics={selectedCivics}
            selectedEthics={selectedEthics}
          />
        </SectionPanel>
      </div>

      {/* Back to Top button */}
      <button 
        className={`back-to-top primary ${showTopBtn ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="Go to top"
      >
        Top
      </button>

      {/* Trait Information Modal */}
      <TraitModal 
        trait={activePopupTrait} 
        onClose={() => setActivePopupTrait(null)} 
      />

      <DisclaimerModal />

      <footer className="app-footer">
        <p>This application is an unofficial, non-commercial fan project. It is not affiliated with, endorsed, sponsored, or specifically approved by Paradox Interactive.</p>
        <p>Stellaris and all related characters, names, and assets are trademarks and copyrighted property of Paradox Interactive.</p>
      </footer>
    </div>
  );
}

export default App
