'use client'

import { useState } from 'react'
import { OrderProductData } from '@/types/types'
import styles from './cardCozinha.module.scss'
import { api } from '@/services/api'
import { getCookieCliente } from '@/lib/cookieClient'
import { Play } from 'lucide-react'

interface CardCozinhaProps {
    item: OrderProductData // ✅ Agora recebe OrderProductData
    onUpdate: () => void
}

export function CardCozinha({ item, onUpdate }: CardCozinhaProps) {
    const [loading, setLoading] = useState(false)

    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'Aguardando':
                return { name: 'Em Preparo', buttonText: 'Iniciar Preparo', color: 'orange' }
            case 'Em Preparo':
                return { name: 'Pronto', buttonText: 'Marcar Pronto', color: 'oliva' }
            case 'Pronto':
                return { name: 'Entregue', buttonText: 'Entregar', color: 'bordo' }
            default:
                return null
        }
    }

    const nextStatus = getNextStatus(item.status.name)

    const getTimeAgo = (date: string) => {
        const now = new Date()
        const itemDate = new Date(date)
        const diffInMinutes = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60))

        if (diffInMinutes < 60) {
            return `${diffInMinutes} min atrás`
        }
        const diffInHours = Math.floor(diffInMinutes / 60)
        return `${diffInHours}h ${diffInMinutes % 60}min atrás`
    }


    const handleUpdateStatus = async () => {
        if (!nextStatus) return

        setLoading(true)
        try {
            const token = getCookieCliente()

            await api.put('/order-product/status',
                {
                    orderProductId: item.id,
                    statusName: nextStatus.name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            onUpdate()
        } catch (error: any) {
            console.error('Erro ao atualizar status:', error)
            const errorMessage = error.response?.data?.error || 'Erro ao atualizar status do item'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2 className={styles.mesa}>{item.order.tables.name}</h2>
                <span className={styles.waiter}>Garçom: {item.order.waiter.name}</span>
            </div>

            <p className={styles.time}>Pedido: {getTimeAgo(item.createdAt)}</p>

            <div className={styles.items}>
                <div className={styles.item}>
                    <span className={styles.amount}>{item.quantity}x</span>
                    <span className={styles.productName}>{item.product.name}</span>
                    {item.description && (
                        <span className={styles.description}>{item.description}</span>
                    )} 
                </div>
            </div>

            {nextStatus && (
                <button
                    className={`${styles.button} ${styles[nextStatus.color]}`}
                    onClick={handleUpdateStatus}
                    disabled={loading}
                >
                    <Play size={20} />
                    {loading ? 'Atualizando...' : nextStatus.buttonText}
                </button>
            )}
        </div>
    )
}
