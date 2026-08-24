---
author: ["PenguinPig"]
title: "Go Language"
date: "2026-08-24T00:54:00.000Z"
description: "Go 筆記"
summary: "Go 筆記"
tags: ["程式設計"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: true
notion_id: "3c6b8bba-f3ba-801d-801c-d8a1c0314d9a"
---
## 📥 收集區（先丟進來就好）

### 內容／片段

- 型別

### 來源

- 連結：

- 截圖／檔案：

### 關鍵字（你之後會怎麼找回來？）

- GO
  - 型別斷言 (type assertion)

```go
x.(int)
```

  - Max Heap (Priority queue)

```go
import (
	"container/heap"
	"math"
)

// MaxHeap 是我們自訂的型別。
// 底層實際上就是 []int。
// 也就是說 MaxHeap 本質上仍然是一個 int slice。
type MaxHeap []int

// Len 回傳 heap 目前有幾個元素。
// container/heap 需要這個 method。
func (h MaxHeap) Len() int {
	return len(h)
}

// Less 用來決定元素的優先順序。
//
// 一般 Min Heap 會寫：
//     return h[i] < h[j]
//
// 這裡我們要 Max Heap，所以反過來：
//     h[i] > h[j]
//
// 意思是：
// 數值越大的元素，優先權越高。
func (h MaxHeap) Less(i, j int) bool {
	return h[i] > h[j]
}

// Swap 交換 slice 中 index i 和 index j 的值。
//
// 這是 Go 常見的交換語法：
//     a, b = b, a
//
// 所以不用額外建立 temp variable。
func (h MaxHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
}

// h *MaxHeap
//
// *MaxHeap 表示：
// h 是一個「指向 MaxHeap 的 pointer」。
//
// 這裡需要 pointer，是因為 Push 會改變 slice 本身的長度。
// 如果不用 pointer，就只會修改 method 內部的副本。
func (h *MaxHeap) Push(x any) {

	// *h 表示：
	// 取得 h 這個 pointer 所指向的真正 MaxHeap。
	//
	// x 的型別是 any。
	// any 在 Go 中等同於 interface{}。
	//
	// x.(int) 是 type assertion，
	// 表示：「我知道 x 裡面實際放的是 int，請把它當成 int 使用。」
	//
	// append 會把新元素加到 slice 最後面。
	*h = append(*h, x.(int))
}

// Pop 也必須使用 pointer，
// 因為它會改變 heap 的長度。
func (h *MaxHeap) Pop() any {

	// *h：取出 pointer 指向的真正 MaxHeap。
	// old 現在是一個 []int / MaxHeap slice。
	old := *h

	// len(old) 取得目前元素數量。
	n := len(old)

	// container/heap 在呼叫我們的 Pop() 前，
	// 已經把要刪除的元素移到最後一個位置。
	//
	// 所以直接取得最後一個元素即可。
	x := old[n-1]

	// slice 語法：
	//
	// old[:n-1]
	//
	// 代表從 index 0 取到 index n-2，
	// 不包含 n-1。
	//
	// 相當於把最後一個元素從 heap 移除。
	*h = old[:n-1]

	// 因為 heap.Interface 要求 Pop() 回傳 any，
	// 所以直接 return int 也可以，
	// Go 會把它包成 any/interface{}。
	return x
}

func pickGifts(gifts []int, k int) int64 {

	// 型別轉換：
	//
	// gifts 是 []int
	// MaxHeap 的底層也是 []int
	//
	// 所以可以把 gifts 轉成 MaxHeap。
	h := MaxHeap(gifts)

	// &h：
	//
	// & 表示「取得變數的記憶體位置」。
	//
	// h      -> MaxHeap value
	// &h     -> *MaxHeap
	//
	// heap.Init 需要可以修改 heap，
	// 所以傳入 pointer。
	heap.Init(&h)

	// 題目要求執行 k 秒，
	// 所以 operation 做 k 次。
	for i := 0; i < k; i++ {

		// heap.Pop(&h)
		//
		// 從 Max Heap 中取出優先權最高的元素，
		// 也就是目前最大的 gift pile。
		//
		// heap.Pop 回傳型別是 any，
		// 所以使用 .(int) 轉回 int。
		maxGift := heap.Pop(&h).(int)

		// math.Sqrt 只能接受 float64。
		//
		// maxGift 原本是 int，
		// 所以先：
		//
		// float64(maxGift)
		//
		// 再做平方根。
		//
		// math.Sqrt 回傳也是 float64，
		// 最後轉回 int。
		//
		// 例如：
		//
		// sqrt(10) = 3.162...
		// int(3.162...) = 3
		//
		// 題目都是正數，所以效果等同 floor。
		maxGift = int(math.Sqrt(float64(maxGift)))

		// 把新的 gift 數量放回 Max Heap。
		//
		// heap.Push 會自動重新調整 heap 結構。
		heap.Push(&h, maxGift)
	}

	// result 使用 int64，
	// 因為 LeetCode 要求 return type 是 int64。
	var result int64 = 0

	// range slice：
	//
	// _    = index，但我們不需要，所以用 _ 忽略
	// gift = 每一個元素的值
	for _, gift := range h {

		// gift 是 int，
		// result 是 int64，
		// Go 不會自動幫你做 numeric type conversion，
		// 所以要明確轉型。
		result += int64(gift)
	}

	return result
}
```

---

## 🧹 整理區（有空才做）

### 這段片段可以變成什麼？

- 可重做的步驟（操作指南）

- 可重用的 code（程式片段）

- 一句話理解（概念）

### 下一次要做的最小整理

- [ ] 補一句摘要

- [ ] 加 1–3 個 Tag

- [ ] 設定重要度

- [ ] 決定要不要勾精選
