'use client'

import { useEffect, useState } from "react"
import styles from "./employer.module.scss"
import { useRouter } from "next/navigation"
import { api } from "@/services/api"
import { getCookie } from "cookies-next"
import { CardEmployer } from "../../../components/CardEmployee"
import { EmployeeData } from "@/types/types"

export default function Employer() {
  const router = useRouter()
  const [employers, setEmployers] = useState<EmployeeData[]>([])
  const [filteredEmployers, setFilteredEmployers] = useState<EmployeeData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProfile, setSelectedProfile] = useState("Todos os cargos")
  const [selectedStatus, setSelectedStatus] = useState("Status")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEmployers() {
      try {
        const token = getCookie("session")
        const response = await api.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setEmployers(response.data)
        setFilteredEmployers(response.data)
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEmployers()
  }, [])

  useEffect(() => {
    let filtered = employers

    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedProfile !== "Todos os cargos") {
      filtered = filtered.filter(emp => emp.accessProfile.name === selectedProfile)
    }

    if (selectedStatus === "Ativo") {
      filtered = filtered.filter(emp => emp.active === true)
    } else if (selectedStatus === "Inativo") {
      filtered = filtered.filter(emp => emp.active === false)
    }

    setFilteredEmployers(filtered)
  }, [searchTerm, selectedProfile, selectedStatus, employers])

  const uniqueProfiles = ["Todos os cargos", ...new Set(employers.map(emp => emp.accessProfile.name))]

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.containerHeader}>
          <h1>Funcionários</h1>
          <button 
            className={styles.addButton}
            onClick={() => router.push("/dashboard/employee/new")}
          >
            + Adicionar Funcionário
          </button>
        </div>

        <div className={styles.filterContainer}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className={styles.filterSelect}
          >
            {uniqueProfiles.map(profile => (
              <option key={profile} value={profile}>{profile}</option>
            ))}
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="Status">Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        <div className={styles.employersGrid}>
          {loading ? (
            <p>Carregando...</p>
          ) : filteredEmployers.length > 0 ? (
            filteredEmployers.map(employer => (
              <CardEmployer key={employer.id} employer={employer} />
            ))
          ) : (
            <p>Nenhum funcionário encontrado</p>
          )}
        </div>
      </div>
    </div>
  )
}
