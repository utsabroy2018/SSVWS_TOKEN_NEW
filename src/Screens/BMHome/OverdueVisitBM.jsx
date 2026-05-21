import React, { useState } from "react"
import Sidebar from "../../Components/Sidebar"
import Payroll from "../Admin/Payroll/Payroll"
import OverdueVisit from "../Admin/OverdueVisit/OverdueVisit"

function OverdueVisitBM() {
	const userDetails = JSON.parse(localStorage.getItem("user_details")) || ""

	return (
		<div>
			<Sidebar mode={2} />
			<OverdueVisit branchCode={+userDetails?.brn_code} />
		</div>
	)
}

export default OverdueVisitBM
