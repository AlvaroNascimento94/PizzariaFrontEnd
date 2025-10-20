'use client'

import { useRouter } from "next/navigation"
import styles from "./cardEmployee.module.scss"
import { EmployeeData } from "@/types/types"

interface CardEmployerProps {
  employer: EmployeeData
}

export function CardEmployer({ employer }: CardEmployerProps) {
  const router = useRouter()

  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleEdit = () => {
    router.push(`/dashboard/employer/${employer.id}`)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.avatarSection}>
          {employer.banner ? (
            <img
              src={`http://localhost:3333/files/${employer.banner}`}
              alt={employer.name}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              👤
            </div>
          )}
        </div>

        <div className={styles.info}>
          <h3>{employer.name}</h3>
          <p className={styles.role}>{employer.accessProfile.name}</p>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={`${styles.status} ${employer.active ? styles.active : styles.inactive}`}>
          {employer.active ? 'Ativo' : 'Inativo'}
        </span>
        <span className={styles.id}>ID: #{employer.id.substring(0, 4).toUpperCase()}</span>
      </div>

      <button className={styles.editButton} onClick={handleEdit}>
        Editar
      </button>
    </div>
  )
}
