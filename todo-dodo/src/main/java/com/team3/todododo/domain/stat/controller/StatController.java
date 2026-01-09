package com.team3.todododo.domain.stat.controller;

import com.team3.todododo.common.response.ApiResult;
import com.team3.todododo.common.security.JwtTokenProvider;
import com.team3.todododo.domain.stat.dto.IncompletePriorityResponse;
import com.team3.todododo.domain.stat.dto.StatOverviewResponse;
import com.team3.todododo.domain.stat.dto.StatusDistributionResponse;
import com.team3.todododo.domain.stat.dto.TodosByPeriodResponse;
import com.team3.todododo.domain.stat.service.StatService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatController {

    private final StatService statService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 사용자별 전체 통계 조회
     */
    @GetMapping("/overview")
    public ApiResult<StatOverviewResponse> getOverviewStats(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ApiResult.success(statService.getOverviewStats(userId));
    }

    /**
     * 사용자별 상태 분포 통계 조회 (완료/미완료)
     */
    @GetMapping("/status-distribution")
    public ApiResult<StatusDistributionResponse> getStatusDistribution(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ApiResult.success(statService.getStatusDistribution(userId));
    }

    /**
     * 사용자별 우선순위별 미완료 통계 조회
     */
    @GetMapping("/incomplete-by-priority")
    public ApiResult<IncompletePriorityResponse> getIncompletePriorityStats(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ApiResult.success(statService.getIncompletePriorityStats(userId));
    }

    /**
     * 시작일부터 오늘까지의 todos 반환
     */
    @GetMapping("/todos-by-period")
    public ApiResult<TodosByPeriodResponse> getTodosByPeriod(
            HttpServletRequest request,
            @RequestParam String period) {
        Long userId = getUserIdFromRequest(request);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        switch (period.toLowerCase()) {
            case "today":
                startDate = endDate;
                break;
            case "week":
                startDate = endDate.minusDays(7);
                break;
            case "month":
                startDate = endDate.minusDays(30);
                break;
            case "6months":
                startDate = endDate.minusMonths(6);
                break;
            default:
                throw new IllegalArgumentException(
                    "Invalid period: " + period + ". Use 'today', 'week', 'month', or '6months'"
                );
        }

        return ApiResult.success(statService.getTodosByPeriod(userId, startDate, endDate));
    }

    /**
     * HTTP 요청에서 JWT 토큰을 추출하여 사용자 ID 반환
     */
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = getJwtFromRequest(request);
        return jwtTokenProvider.getUserIdFromJWT(token);
    }

    /**
     * HTTP 요청 헤더에서 JWT 토큰 추출
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
