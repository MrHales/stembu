import React, { useState, useEffect } from 'react'
import './index.css'
import SpeciesTypeSection from './components/SpeciesTypeSection'
import SpeciesTraitsSection from './components/SpeciesTraitsSection'
import TraitModal from './components/TraitModal'
import DisclaimerModal from './components/DisclaimerModal'
import AuthoritySection from './components/AuthoritySection'
import CivicsSection from './components/CivicsSection'
import GovernmentTypeSection from './components/GovernmentTypeSection'
import EthicsSection from './components/EthicsSection'
import HomeworldSection from './components/HomeworldSection'
import OriginSection from './components/OriginSection'
import { checkCivicRequirements } from './utils/requirements'
import { aggregateEffects } from './utils/aggregator'

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
  const [selectedEthics, setSelectedEthics] = useState([])
  
  // Homeworld State
  const [homeworldName, setHomeworldName] = useState("Earth")
  const [selectedClimate, setSelectedClimate] = useState(null)
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  
  // Origin State
  const [selectedOrigin, setSelectedOrigin] = useState(null)

  const handleOriginSelect = (origin) => {
    const originName = origin ? origin.name : null;
    const oldOriginName = selectedOrigin ? selectedOrigin.name : null;
    
    if (originName === oldOriginName) return;

    setSelectedOrigin(origin);
    
    let traitsToAdd = [];
    let traitsToRemove = [];
    
    if (oldOriginName === "Void Dwellers") traitsToRemove.push("Void Dweller");
    if (oldOriginName === "Post-Apocalyptic") {
       traitsToRemove.push("Survivor");
    }
    if (oldOriginName === "Necrophage") traitsToRemove.push("Necrophage");
    
    if (originName === "Void Dwellers") traitsToAdd.push("Void Dweller");
    if (originName === "Post-Apocalyptic") {
       traitsToAdd.push("Survivor");
    }
    if (originName === "Necrophage") traitsToAdd.push("Necrophage");

    if (traitsToAdd.length > 0 || traitsToRemove.length > 0) {
      setSelectedTraits(prev => {
        let newTraits = prev.filter(t => !traitsToRemove.includes(t.name));
        
        traitsToAdd.forEach(traitName => {
           if (!newTraits.some(t => t.name === traitName)) {
               newTraits.push({ 
                 name: traitName, 
                 points: 0, 
                 description: "Auto-assigned by Origin",
                 effects: "See Origin details for more information."
               });
           }
        });
        
        return newTraits;
      });
    }
  }

  const getEffectiveHomeworldType = () => {
    if (!selectedOrigin) return selectedPlanet?.name || ""
    switch (selectedOrigin.name) {
      case "Post-Apocalyptic": return "Tomb World"
      case "Life-Seeded": return "Gaia World"
      case "Remnants": return "Relic World"
      case "Resource Consolidation": return "Machine World"
      case "Ocean Paradise": return "Ocean World"
      case "Shattered Ring": return "Shattered Ring World"
      case "Void Dwellers": 
      case "Knights of the Toxic God": return "Habitat"
      case "Red Giant":
      case "Cosmic Dawn":
      case "Planet Forgers": return "Volcanic World"
      case "Calamitous Birth": return `${selectedPlanet?.name || "Planet"} (Massive Crater)`
      default: return selectedPlanet?.name || ""
    }
  }

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
    setSelectedEthics([])
    setHomeworldName("Earth")
    setSelectedClimate(null)
    setSelectedPlanet(null)
    setSelectedOrigin(null)
  }

  // Auto-deselection of invalid Civics
  useEffect(() => {
    if (selectedCivics.length === 0) return;
    
    setSelectedCivics(prev => {
      const validCivics = prev.filter(civic => 
        checkCivicRequirements(civic.Requirements, {
          authority: selectedAuthority,
          ethics: selectedEthics,
          origin: selectedOrigin,
          speciesType: speciesType
        })
      );
      
      if (validCivics.length !== prev.length) {
        return validCivics;
      }
      return prev;
    });
  }, [selectedAuthority, selectedEthics, selectedOrigin, speciesType]);

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
        if (prev.length >= 2) return prev; // max 2 during creation
        return [...prev, civic]
      }
    })
  }

  const handleEthicToggle = (ethic) => {
    setSelectedEthics(prev => {
      const isSelected = prev.some(e => e.name === ethic.name)
      if (isSelected) {
        return prev.filter(e => e.name !== ethic.name)
      } else {
        return [...prev, ethic]
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
      <div className="summary-segment split-summary">
        <div className="summary-column">
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
            <strong className="text-accent">Homeworld:</strong>{' '}
            {homeworldName}{getEffectiveHomeworldType() ? ` (${getEffectiveHomeworldType()})` : ''}
          </p>
          <p>
            <strong className="text-accent">Origin:</strong>{' '}
            {selectedOrigin ? (
              <span 
                className="summary-trait-tag"
                onClick={() => setActivePopupTrait({
                  name: selectedOrigin.name,
                  description: null,
                  effects: `Empire Effects:\n${selectedOrigin['Empire effects']}\n\nHomeworld Effects:\n${selectedOrigin['Homeworld effects']}`
                })}
              >
                {selectedOrigin.name}
              </span>
            ) : (
              <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>None</span>
            )}
          </p>
          <p>
            <strong className="text-accent">Ethics:</strong> 
            {selectedEthics.length > 0 ? (
              selectedEthics.map(e => (
                <span 
                  key={e.name} 
                  className="summary-trait-tag"
                  onClick={() => setActivePopupTrait({
                    name: e.name,
                    description: e.Description,
                    effects: e.Effects
                  })}
                >
                  {e.name}
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
                  effects: `Empire Effects:\n${selectedAuthority['Empire effects']}\n\nRuler Effects per Level:\n${selectedAuthority['Ruler effects per skill level']}`,
                  requirements: selectedAuthority.Requirements
                })}
              >
                {selectedAuthority.name}
              </span>
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
        </div>

        <div className="summary-column totals-column">
           <h3>Total Empire Effects</h3>
           {(() => {
              const allEffects = [
                ...selectedTraits.map(t => t.effects),
                ...selectedEthics.map(e => e.Effects),
                selectedAuthority ? selectedAuthority['Empire effects'] : '',
                ...selectedCivics.map(c => c.Effects),
                selectedOrigin ? `${selectedOrigin['Empire effects']}\n${selectedOrigin['Homeworld effects']}` : ''
              ];
              const totals = aggregateEffects(allEffects);
              
              if (totals.numeric.length === 0 && totals.features.length === 0) {
                 return <p style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No effects active yet.</p>;
              }

              return (
                 <div className="totals-content">
                    {totals.numeric.length > 0 && (
                      <div className="totals-group">
                         {totals.numeric.map((item, idx) => (
                            <div key={idx} className="total-item">
                               <span className={`total-value ${item.value < 0 ? 'negative' : 'positive'}`}>
                                  {item.value > 0 ? '+' : ''}{item.value}{item.isPercent ? '%' : ''}
                               </span>
                               <span className="total-desc">{item.description}</span>
                            </div>
                         ))}
                      </div>
                    )}
                    {totals.features.length > 0 && (
                       <div className="totals-group features-list">
                          {totals.features.map((feature, idx) => (
                             <div key={idx} className="total-feature">
                                <span className="feature-bullet">✦</span> {feature}
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              );
           })()}
        </div>
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
        >
          <HomeworldSection 
            homeworldName={homeworldName}
            setHomeworldName={setHomeworldName}
            selectedClimate={selectedClimate}
            setSelectedClimate={setSelectedClimate}
            selectedPlanet={selectedPlanet}
            setSelectedPlanet={setSelectedPlanet}
            onPlanetInfoClick={setActivePopupTrait}
          />
        </SectionPanel>
        
        <SectionPanel 
          title="Origin" 
          description="How did your civilization reach the stars?" 
        >
          <OriginSection 
            selectedOrigin={selectedOrigin}
            onOriginSelect={handleOriginSelect}
            onOriginInfoClick={setActivePopupTrait}
            speciesType={speciesType}
            selectedEthics={selectedEthics}
          />
        </SectionPanel>

        <SectionPanel 
          title="Name Lists & Flag" 
          description="Designate your cultural nomenclature and cosmic heraldry." 
        />
      </main>

      <h2 style={{ marginTop: '3rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Government Structure</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <SectionPanel 
          title="Ethics" 
          description="Define the core beliefs and guiding principles of your empire." 
        >
          <EthicsSection 
            selectedEthics={selectedEthics}
            onEthicToggle={handleEthicToggle}
            onEthicInfoClick={setActivePopupTrait}
          />
        </SectionPanel>
      </div>

      <div className="government-grid">
        <SectionPanel 
          title="Authority" 
          description="Determine your authority structure." 
        >
          <AuthoritySection 
            selectedAuthority={selectedAuthority}
            onSelectAuthority={setSelectedAuthority}
            speciesType={speciesType}
            selectedEthics={selectedEthics}
            onAuthorityInfoClick={setActivePopupTrait}
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
            selectedAuthority={selectedAuthority}
            selectedEthics={selectedEthics}
            selectedOrigin={selectedOrigin}
            speciesType={speciesType}
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
